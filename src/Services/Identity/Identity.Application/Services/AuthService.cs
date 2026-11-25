using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Auth;
using Identity.Application.Interfaces.Repositories;
using Identity.Application.Interfaces.Services;
using Identity.Domain.Entities;
using Identity.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IValidator<LoginRequestDto> _validator;
    private readonly IValidator<GymLoginRequestDto> _gymLoginValidator;
    private readonly ILogger<AuthService> _logger;

    // Pre-computed dummy hash to run constant-time comparison when email is not found, preventing user enumeration timing attacks
    private const string DummyHash = "$2a$12$e80yq5E7Y4yqPcvK.1v75.Ew5J0dY4X7v3R3uQv8P3M5bCq.gIqW6";

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IValidator<LoginRequestDto> validator,
        IValidator<GymLoginRequestDto> gymLoginValidator,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _validator = validator;
        _gymLoginValidator = gymLoginValidator;
        _logger = logger;
    }

    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.ConvertAll(e => e.ErrorMessage);
            return ApiResponse<LoginResponseDto>.ValidationFail("Validation failed.", errors);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        var authFailure = VerifyCredentials<LoginResponseDto>(user, request.Email, request.Password);
        if (authFailure != null)
        {
            return authFailure;
        }

        var (accessToken, rawRefreshToken, expiresIn) = await IssueAndPersistTokensAsync(user!, cancellationToken);
        _logger.LogInformation("SuperAdmin/User {Email} logged in successfully.", user!.Email);

        return ApiResponse<LoginResponseDto>.Ok(new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            ExpiresIn = expiresIn,
            User = new UserDto
            {
                Id = user.Id,
                GymId = user.GymId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = (int)user.Role,
                RoleName = user.Role.ToString(),
                ProfileImageUrl = user.ProfileImageUrl
            }
        }, "Login successful.");
    }

    public async Task<ApiResponse<GymLoginResponseDto>> GymLoginAsync(GymLoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _gymLoginValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.ConvertAll(e => e.ErrorMessage);
            return ApiResponse<GymLoginResponseDto>.ValidationFail("Validation failed.", errors);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailWithGymAsync(normalizedEmail, cancellationToken);

        if (user != null && user.Role == UserRole.SuperAdmin)
        {
            _logger.LogWarning("SuperAdmin {Email} attempted gym portal login.", user.Email);
            return ApiResponse<GymLoginResponseDto>.Unauthorized("Invalid account type for gym portal. Please use the Super Admin portal.");
        }

        if (user != null && (!user.GymId.HasValue || user.Gym == null))
        {
            _logger.LogWarning("User {Email} has no gym associated.", user.Email);
            return ApiResponse<GymLoginResponseDto>.Unauthorized("No gym found for this account. Please contact support.");
        }

        var authFailure = VerifyCredentials<GymLoginResponseDto>(user, request.Email, request.Password);
        if (authFailure != null)
        {
            return authFailure;
        }

        var (accessToken, rawRefreshToken, expiresIn) = await IssueAndPersistTokensAsync(user!, cancellationToken);
        _logger.LogInformation("Gym user {Email} ({Role}) logged in successfully to gym {GymName}.", user!.Email, user.Role, user.Gym!.Name);

        return ApiResponse<GymLoginResponseDto>.Ok(new GymLoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            ExpiresIn = expiresIn,
            User = new GymUserDto
            {
                Id = user.Id,
                GymId = user.Gym.Id,
                GymName = user.Gym.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = (int)user.Role,
                RoleName = user.Role.ToString(),
                ProfileImageUrl = user.ProfileImageUrl
            }
        }, "Login successful.");
    }

    public async Task<ApiResponse<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return ApiResponse<RefreshTokenResponseDto>.Unauthorized("Refresh token is required.");
        }

        var tokenHash = _jwtTokenGenerator.HashToken(request.RefreshToken.Trim());
        var storedToken = await _refreshTokenRepository.GetByTokenAsync(tokenHash, cancellationToken);
        if (storedToken == null)
        {
            _logger.LogWarning("Refresh token attempt failed: Token not found.");
            return ApiResponse<RefreshTokenResponseDto>.Unauthorized("Invalid refresh token.");
        }

        if (storedToken.IsRevoked)
        {
            // Token reuse detected — revoke all active tokens for this user
            _logger.LogWarning("Revoked refresh token reuse detected for User {UserId}. Revoking all sessions.", storedToken.UserId);
            await _refreshTokenRepository.RevokeUserTokensAsync(storedToken.UserId, cancellationToken);
            return ApiResponse<RefreshTokenResponseDto>.Unauthorized("Refresh token has been revoked.");
        }

        if (storedToken.ExpiresAt <= DateTime.UtcNow)
        {
            _logger.LogInformation("Refresh token expired for User {UserId}.", storedToken.UserId);
            return ApiResponse<RefreshTokenResponseDto>.Unauthorized("Refresh token has expired. Please log in again.");
        }

        var user = storedToken.User;
        if (user == null || user.Status != UserStatus.Active)
        {
            _logger.LogWarning("Refresh token rejected: User {UserId} is missing or not active.", storedToken.UserId);
            return ApiResponse<RefreshTokenResponseDto>.Unauthorized("Account is not active. Please contact your administrator.");
        }

        // Rotate tokens and store only hashed token values
        var (accessToken, expiresIn) = _jwtTokenGenerator.GenerateAccessToken(user);
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken(user);
        var rawNewRefreshToken = newRefreshToken.Token;
        newRefreshToken.Token = _jwtTokenGenerator.HashToken(rawNewRefreshToken);

        storedToken.IsRevoked = true;
        storedToken.ReplacedByToken = newRefreshToken.Token;
        await _refreshTokenRepository.UpdateAsync(storedToken, cancellationToken);
        await _refreshTokenRepository.AddAsync(newRefreshToken, cancellationToken);

        _logger.LogInformation("Access token refreshed for User {UserId}.", user.Id);

        return ApiResponse<RefreshTokenResponseDto>.Ok(new RefreshTokenResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = rawNewRefreshToken,
            ExpiresIn = expiresIn
        }, "Token refreshed successfully.");
    }

    private ApiResponse<T>? VerifyCredentials<T>(User? user, string rawEmail, string password)
    {
        if (user == null)
        {
            _passwordHasher.VerifyPassword(password, DummyHash);
            _logger.LogWarning("Login attempt failed: Email not registered {Email}", rawEmail);
            return ApiResponse<T>.Unauthorized("Invalid email or password.");
        }

        if (user.Status != UserStatus.Active)
        {
            _logger.LogWarning("Login attempt rejected for {Email}: Status is {Status}", rawEmail, user.Status);
            return ApiResponse<T>.Unauthorized(GetInactiveStatusMessage(user.Status));
        }

        if (!_passwordHasher.VerifyPassword(password, user.PasswordHash))
        {
            _logger.LogWarning("Login attempt failed: Password mismatch {Email}", rawEmail);
            return ApiResponse<T>.Unauthorized("Invalid email or password.");
        }

        return null;
    }

    private async Task<(string AccessToken, string RawRefreshToken, int ExpiresIn)> IssueAndPersistTokensAsync(
        User user,
        CancellationToken cancellationToken)
    {
        var (accessToken, expiresIn) = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken(user);
        var rawRefreshToken = refreshToken.Token;
        refreshToken.Token = _jwtTokenGenerator.HashToken(rawRefreshToken);

        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);

        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        return (accessToken, rawRefreshToken, expiresIn);
    }

    private static string GetInactiveStatusMessage(UserStatus status) => status switch
    {
        UserStatus.Pending => "Your account is pending SuperAdmin approval.",
        UserStatus.Inactive => "Account is deactivated. Please contact your administrator.",
        UserStatus.Rejected => "Your account application has been rejected.",
        UserStatus.Deleted => "Account not found or has been deleted.",
        _ => "Account is not active. Please contact your administrator."
    };
}
