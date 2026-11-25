using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Receptionist;
using Identity.Application.Interfaces.Repositories;
using Identity.Application.Interfaces.Services;
using Identity.Domain.Entities;
using Identity.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IValidator<CreateReceptionistRequestDto> _createReceptionistValidator;
    private readonly IValidator<UpdateReceptionistRequestDto> _updateReceptionistValidator;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IValidator<CreateReceptionistRequestDto> createReceptionistValidator,
        IValidator<UpdateReceptionistRequestDto> updateReceptionistValidator,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _createReceptionistValidator = createReceptionistValidator;
        _updateReceptionistValidator = updateReceptionistValidator;
        _logger = logger;
    }

    public async Task<ApiResponse<ReceptionistDto>> CreateReceptionistAsync(
        Guid ownerId,
        Guid gymId,
        CreateReceptionistRequestDto request,
        CancellationToken cancellationToken = default)
    {
        // 1. Fluent Validation
        var validationResult = await _createReceptionistValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.ConvertAll(e => e.ErrorMessage);
            return ApiResponse<ReceptionistDto>.ValidationFail("Validation failed.", errors);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedPhone = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

        // 2. Uniqueness checks
        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
        {
            return ApiResponse<ReceptionistDto>.Conflict($"A user with email '{request.Email}' already exists.");
        }

        if (!string.IsNullOrWhiteSpace(normalizedPhone) &&
            await _userRepository.ExistsByPhoneNumberAsync(normalizedPhone, cancellationToken))
        {
            return ApiResponse<ReceptionistDto>.Conflict($"A user with phone number '{request.PhoneNumber}' already exists.");
        }

        // 3. Hash Password & Construct User Entity
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var receptionist = new User
        {
            Id = Guid.NewGuid(),
            GymId = gymId,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedEmail,
            PhoneNumber = normalizedPhone,
            PasswordHash = passwordHash,
            Role = UserRole.Receptionist,
            Status = UserStatus.Active,
            MustChangePassword = true,
            CreatedBy = ownerId,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(receptionist, cancellationToken);
        _logger.LogInformation("Receptionist {Email} created for Gym {GymId} by Owner {OwnerId}", receptionist.Email, gymId, ownerId);

        var responseDto = MapToReceptionistDto(receptionist);
        return ApiResponse<ReceptionistDto>.Ok(responseDto, "Receptionist created successfully.");
    }

    public async Task<ApiResponse<List<ReceptionistDto>>> GetReceptionistsByGymIdAsync(
        Guid gymId,
        CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetReceptionistsByGymIdAsync(gymId, cancellationToken);
        var dtos = users.Select(MapToReceptionistDto).ToList();
        return ApiResponse<List<ReceptionistDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<ReceptionistDto>> GetReceptionistByIdAsync(
        Guid gymId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAndGymIdAsync(userId, gymId, cancellationToken);
        if (user == null || user.Status == UserStatus.Deleted || user.Role != UserRole.Receptionist)
        {
            return ApiResponse<ReceptionistDto>.NotFound("Receptionist not found in your gym.");
        }

        return ApiResponse<ReceptionistDto>.Ok(MapToReceptionistDto(user));
    }

    public async Task<ApiResponse<ReceptionistDto>> UpdateReceptionistAsync(
        Guid ownerId,
        Guid gymId,
        Guid userId,
        UpdateReceptionistRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateReceptionistValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.ConvertAll(e => e.ErrorMessage);
            return ApiResponse<ReceptionistDto>.Fail("Validation failed.", errors);
        }

        var user = await _userRepository.GetByIdAndGymIdAsync(userId, gymId, cancellationToken);
        if (user == null || user.Status == UserStatus.Deleted || user.Role != UserRole.Receptionist)
        {
            return ApiResponse<ReceptionistDto>.NotFound("Receptionist not found in your gym.");
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = ownerId;

        await _userRepository.UpdateAsync(user, cancellationToken);
        _logger.LogInformation("Receptionist {UserId} updated in Gym {GymId} by Owner {OwnerId}", user.Id, gymId, ownerId);

        return ApiResponse<ReceptionistDto>.Ok(MapToReceptionistDto(user), "Receptionist details updated successfully.");
    }

    public async Task<ApiResponse<ReceptionistDto>> ToggleUserStatusAsync(
        Guid gymId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAndGymIdAsync(userId, gymId, cancellationToken);
        if (user == null || user.Status == UserStatus.Deleted || user.Role != UserRole.Receptionist)
        {
            return ApiResponse<ReceptionistDto>.NotFound("Receptionist not found in your gym.");
        }

        // Toggle Active <-> Inactive
        user.Status = user.Status == UserStatus.Active ? UserStatus.Inactive : UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);
        _logger.LogInformation("User {UserId} status changed to {Status} in Gym {GymId}", user.Id, user.Status, gymId);

        var responseDto = MapToReceptionistDto(user);
        var statusLabel = user.Status == UserStatus.Active ? "activated" : "deactivated";
        return ApiResponse<ReceptionistDto>.Ok(responseDto, $"User successfully {statusLabel}.");
    }

    public async Task<ApiResponse<bool>> DeleteReceptionistAsync(
        Guid gymId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAndGymIdAsync(userId, gymId, cancellationToken);
        if (user == null || user.Status == UserStatus.Deleted || user.Role != UserRole.Receptionist)
        {
            return ApiResponse<bool>.NotFound("Receptionist not found in your gym.");
        }

        user.Status = UserStatus.Deleted;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);
        _logger.LogInformation("Receptionist {UserId} soft-deleted in Gym {GymId}", user.Id, gymId);

        return ApiResponse<bool>.Ok(true, "Receptionist deleted successfully.");
    }

    private static ReceptionistDto MapToReceptionistDto(User user)
    {
        return new ReceptionistDto
        {
            Id = user.Id,
            GymId = user.GymId ?? Guid.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Status = (int)user.Status,
            StatusName = user.Status.ToString(),
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
