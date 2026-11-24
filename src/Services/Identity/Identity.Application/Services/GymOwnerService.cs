using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Request;
using Identity.Application.DTOs.Response;
using Identity.Application.Interfaces.Repositories;
using Identity.Application.Interfaces.Services;
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
        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize < 1 ? 10 : (request.PageSize > 100 ? 100 : request.PageSize);

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
}
