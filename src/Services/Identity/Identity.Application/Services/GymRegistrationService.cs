using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Request;
using Identity.Application.DTOs.Response;
using Identity.Application.Interfaces.Repositories;
using Identity.Application.Interfaces.Services;
using Identity.Domain.Entities;
using Identity.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Services;

public class GymRegistrationService : IGymRegistrationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGymRepository _gymRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IValidator<GymRegisterRequestDto> _validator;
    private readonly ILogger<GymRegistrationService> _logger;

    public GymRegistrationService(
        IUnitOfWork unitOfWork,
        IGymRepository gymRepository,
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IValidator<GymRegisterRequestDto> validator,
        ILogger<GymRegistrationService> logger)
    {
        _unitOfWork = unitOfWork;
        _gymRepository = gymRepository;
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _validator = validator;
        _logger = logger;
    }

    public async Task<ApiResponse<GymRegisterResponseDto>> RegisterGymAsync(GymRegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        // 1. Fluent Validation
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.ConvertAll(e => e.ErrorMessage);
            return ApiResponse<GymRegisterResponseDto>.Fail("Validation failed.", errors);
        }

        var normalizedGymEmail = request.GymEmail.Trim().ToLowerInvariant();
        var normalizedOwnerEmail = request.OwnerEmail.Trim().ToLowerInvariant();
        var normalizedGymPhone = request.GymPhoneNumber.Trim();
        var normalizedOwnerPhone = (request.OwnerPhoneNumber ?? request.GymPhoneNumber).Trim();

        var validationErrors = new List<string>();

        // 2. Service Layer Validations
        // (a) Gym official email unique
        if (await _gymRepository.ExistsByEmailAsync(normalizedGymEmail, cancellationToken))
        {
            validationErrors.Add($"Gym with official email '{request.GymEmail}' is already registered.");
        }

        // (b) Gym phone number exists
        if (await _gymRepository.ExistsByPhoneNumberAsync(normalizedGymPhone, cancellationToken))
        {
            validationErrors.Add($"Gym with phone number '{request.GymPhoneNumber}' is already registered.");
        }

        // (c) Owner email exists in Users table
        if (await _userRepository.ExistsByEmailAsync(normalizedOwnerEmail, cancellationToken))
        {
            validationErrors.Add($"A user with email '{request.OwnerEmail}' already exists.");
        }

        // (d) Owner phone number exists in Users table
        if (!string.IsNullOrWhiteSpace(normalizedOwnerPhone) &&
            await _userRepository.ExistsByPhoneNumberAsync(normalizedOwnerPhone, cancellationToken))
        {
            validationErrors.Add($"A user with phone number '{normalizedOwnerPhone}' already exists.");
        }

        if (validationErrors.Count > 0)
        {
            _logger.LogWarning("Gym registration rejected due to duplicate parameters: {Errors}", string.Join(", ", validationErrors));
            return ApiResponse<GymRegisterResponseDto>.Conflict("Registration details already exist.", validationErrors);
        }

        // 3. Create Gym + Owner User atomically
        var gym = new Gym
        {
            Id = Guid.NewGuid(),
            Name = request.GymName.Trim(),
            Email = normalizedGymEmail,
            PhoneNumber = normalizedGymPhone,
            AddressLine1 = request.AddressLine1.Trim(),
            AddressLine2 = request.AddressLine2?.Trim(),
            City = request.City.Trim(),
            State = request.State?.Trim() ?? string.Empty,
            Country = string.IsNullOrWhiteSpace(request.Country) ? "India" : request.Country.Trim(),
            PinCode = request.PinCode.Trim(),
            WebsiteUrl = request.WebsiteUrl?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var passwordHash = _passwordHasher.HashPassword(request.Password);
        var ownerUser = new User
        {
            Id = Guid.NewGuid(),
            GymId = gym.Id,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedOwnerEmail,
            PhoneNumber = normalizedOwnerPhone,
            PasswordHash = passwordHash,
            Role = UserRole.GymOwner,
            Status = UserStatus.Pending, // Pending until approved by SuperAdmin
            MustChangePassword = false,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            await _gymRepository.AddAsync(gym, ct);
            await _userRepository.AddAsync(ownerUser, ct);
        }, cancellationToken);

        _logger.LogInformation("Successfully registered Gym {GymName} ({GymId}) with Owner {OwnerEmail} ({OwnerId}) in Pending state",
            gym.Name, gym.Id, ownerUser.Email, ownerUser.Id);

        var responseData = new GymRegisterResponseDto
        {
            GymId = gym.Id,
            GymName = gym.Name,
            GymEmail = gym.Email,
            OwnerId = ownerUser.Id,
            OwnerName = $"{ownerUser.FirstName} {ownerUser.LastName}",
            OwnerEmail = ownerUser.Email,
            Role = ownerUser.Role.ToString(),
            Status = ownerUser.Status.ToString(),
            RegisteredAt = gym.CreatedAt,
            Message = "Gym registration submitted successfully. Your account is pending SuperAdmin approval."
        };

        return ApiResponse<GymRegisterResponseDto>.Ok(responseData, "Gym registered successfully. Awaiting approval.");
    }
}
