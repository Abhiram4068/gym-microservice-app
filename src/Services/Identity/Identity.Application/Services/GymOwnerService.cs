using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Pagination;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Request;
using Identity.Application.DTOs.Response;
using Identity.Application.Interfaces.Repositories;
using Identity.Application.Interfaces.Services;
using Identity.Domain.Entities;
using Identity.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Services;

public class GymOwnerService : IGymOwnerService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<GymOwnerService> _logger;

    public GymOwnerService(IUserRepository userRepository, ILogger<GymOwnerService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<PagedResult<GymOwnerListItemDto>>> GetGymOwnersAsync(
        GetGymOwnersRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var (pageNumber, pageSize) = PaginationHelper.Normalize(request.PageNumber, request.PageSize);

        var (users, totalCount) = await _userRepository.GetGymOwnersPagedAsync(
            request.Search,
            request.Status,
            request.SortBy,
            request.SortOrder,
            pageNumber,
            pageSize,
            cancellationToken);

        var items = users.Select(u => new GymOwnerListItemDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            FullName = $"{u.FirstName} {u.LastName}".Trim(),
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            ProfileImageUrl = u.ProfileImageUrl,
            Status = u.Status,
            StatusName = u.Status.ToString(),
            CreatedAt = u.CreatedAt,
            GymId = u.GymId,
            GymName = u.Gym?.Name,
            GymEmail = u.Gym?.Email,
            GymPhoneNumber = u.Gym?.PhoneNumber,
            City = u.Gym?.City,
            State = u.Gym?.State
        }).ToList();

        var pagedResult = PagedResult<GymOwnerListItemDto>.Create(items, totalCount, pageNumber, pageSize);

        _logger.LogInformation("Retrieved {Count} gym owners (Page {PageNumber}/{TotalPages}, Total: {TotalCount})",
            items.Count, pagedResult.PageNumber, pagedResult.TotalPages, totalCount);

        return ApiResponse<PagedResult<GymOwnerListItemDto>>.Ok(pagedResult, "Gym owners retrieved successfully.");
    }

    public async Task<ApiResponse<GymOwnerDetailDto>> GetGymOwnerByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            return ApiResponse<GymOwnerDetailDto>.Fail("A valid Gym Owner ID must be provided.");
        }

        var user = await _userRepository.GetGymOwnerByIdAsync(id, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("Gym owner with ID {OwnerId} was not found", id);
            return ApiResponse<GymOwnerDetailDto>.NotFound($"Gym owner with ID '{id}' was not found.");
        }

        var detailDto = MapToDetailDto(user);

        return ApiResponse<GymOwnerDetailDto>.Ok(detailDto, "Gym owner details retrieved successfully.");
    }

    public async Task<ApiResponse<GymOwnerDetailDto>> ApproveGymOwnerAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            return ApiResponse<GymOwnerDetailDto>.Fail("A valid Gym Owner ID must be provided.");
        }

        var user = await _userRepository.GetGymOwnerByIdForUpdateAsync(id, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("Gym owner with ID {OwnerId} was not found for approval", id);
            return ApiResponse<GymOwnerDetailDto>.NotFound($"Gym owner with ID '{id}' was not found.");
        }

        if (user.Status == UserStatus.Active)
        {
            return ApiResponse<GymOwnerDetailDto>.Conflict("This gym owner is already approved and active.");
        }

        if (user.Status == UserStatus.Deleted)
        {
            return ApiResponse<GymOwnerDetailDto>.Fail("Cannot approve a deleted gym owner account.");
        }

        user.Status = UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;

        if (user.Gym != null)
        {
            user.Gym.RejectionReason = null;
            user.Gym.UpdatedAt = DateTime.UtcNow;
        }

        await _userRepository.UpdateAsync(user, cancellationToken);

        _logger.LogInformation("Gym owner {OwnerId} ({OwnerEmail}) and gym {GymId} successfully approved by admin",
            user.Id, user.Email, user.GymId);

        return ApiResponse<GymOwnerDetailDto>.Ok(MapToDetailDto(user), "Gym owner and gym application approved successfully. Account is now active.");
    }

    public async Task<ApiResponse<GymOwnerDetailDto>> RejectGymOwnerAsync(
        Guid id,
        RejectGymOwnerRequestDto? request,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
        {
            return ApiResponse<GymOwnerDetailDto>.Fail("A valid Gym Owner ID must be provided.");
        }

        var user = await _userRepository.GetGymOwnerByIdForUpdateAsync(id, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("Gym owner with ID {OwnerId} was not found for rejection", id);
            return ApiResponse<GymOwnerDetailDto>.NotFound($"Gym owner with ID '{id}' was not found.");
        }

        if (user.Status == UserStatus.Rejected)
        {
            return ApiResponse<GymOwnerDetailDto>.Conflict("This gym owner application is already rejected.");
        }

        if (user.Status == UserStatus.Deleted)
        {
            return ApiResponse<GymOwnerDetailDto>.Fail("Cannot reject a deleted gym owner account.");
        }

        user.Status = UserStatus.Rejected;
        user.UpdatedAt = DateTime.UtcNow;

        if (user.Gym != null)
        {
            user.Gym.RejectionReason = string.IsNullOrWhiteSpace(request?.RejectionReason)
                ? null
                : request.RejectionReason.Trim();
            user.Gym.UpdatedAt = DateTime.UtcNow;
        }

        await _userRepository.UpdateAsync(user, cancellationToken);

        _logger.LogInformation("Gym owner {OwnerId} ({OwnerEmail}) rejected by admin. Reason: {Reason}",
            user.Id, user.Email, user.Gym?.RejectionReason ?? "None");

        return ApiResponse<GymOwnerDetailDto>.Ok(MapToDetailDto(user), "Gym owner application rejected successfully.");
    }

    private static GymOwnerDetailDto MapToDetailDto(User user)
    {
        return new GymOwnerDetailDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            Status = user.Status,
            StatusName = user.Status.ToString(),
            MustChangePassword = user.MustChangePassword,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Gym = user.Gym == null ? null : new GymDetailDto
            {
                Id = user.Gym.Id,
                Name = user.Gym.Name,
                Email = user.Gym.Email,
                PhoneNumber = user.Gym.PhoneNumber,
                AddressLine1 = user.Gym.AddressLine1,
                AddressLine2 = user.Gym.AddressLine2,
                City = user.Gym.City,
                State = user.Gym.State,
                Country = user.Gym.Country,
                PinCode = user.Gym.PinCode,
                WebsiteUrl = user.Gym.WebsiteUrl,
                LogoUrl = user.Gym.LogoUrl,
                RejectionReason = user.Gym.RejectionReason,
                CreatedAt = user.Gym.CreatedAt,
                UpdatedAt = user.Gym.UpdatedAt
            }
        };
    }
}
