using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Auth;
using Identity.Application.Interfaces.Repositories;
using Identity.Application.Interfaces.Services;
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
    private readonly ILogger<AuthService> _logger;

    // Pre-computed dummy hash to run constant-time comparison when email is not found, preventing user enumeration timing attacks
    private const string DummyHash = "$2a$12$e80yq5E7Y4yqPcvK.1v75.Ew5J0dY4X7v3R3uQv8P3M5bCq.gIqW6";

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IValidator<LoginRequestDto> validator,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _validator = validator;
        _logger = logger;
    }

    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.ConvertAll(e => e.ErrorMessage);
            return ApiResponse<LoginResponseDto>.Fail("Validation failed.", errors);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user == null)
        {
            // Execute dummy verification to prevent timing attack enumeration
            _passwordHasher.VerifyPassword(request.Password, DummyHash);
            _logger.LogWarning("Login attempt failed: Email not registered {Email}", request.Email);
            return ApiResponse<LoginResponseDto>.Fail("Invalid email or password.");
        }

        if (user.Status != UserStatus.Active)
        {
            var message = user.Status switch
            {
                UserStatus.Pending => "Your account is pending SuperAdmin approval.",
                UserStatus.Inactive => "Account is deactivated. Please contact your administrator.",
                UserStatus.Rejected => "Your account application has been rejected.",
                UserStatus.Deleted => "Account not found or has been deleted.",
                _ => "Account is not active. Please contact your administrator."
            };
            _logger.LogWarning("Login attempt rejected for {Email}: Status is {Status}", request.Email, user.Status);
            return ApiResponse<LoginResponseDto>.Fail(message);
        }

        var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Login attempt failed: Password mismatch {Email}", request.Email);
            return ApiResponse<LoginResponseDto>.Fail("Invalid email or password.");
        }

        // Generate tokens
        var (accessToken, expiresIn) = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken(user);

        // Store refresh token
        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        _logger.LogInformation("SuperAdmin/User {Email} logged in successfully.", user.Email);

        var responseDto = new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
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
        };

        return ApiResponse<LoginResponseDto>.Ok(responseDto, "Login successful.");
    }
}
