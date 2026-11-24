using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Request;
using Identity.Application.DTOs.Response;

namespace Identity.Application.Interfaces.Services;

public interface IGymOwnerService
{
    Task<ApiResponse<PagedResult<GymOwnerListItemDto>>> GetGymOwnersAsync(
        GetGymOwnersRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<GymOwnerDetailDto>> GetGymOwnerByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<GymOwnerDetailDto>> ApproveGymOwnerAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<GymOwnerDetailDto>> RejectGymOwnerAsync(
        Guid id,
        RejectGymOwnerRequestDto? request,
        CancellationToken cancellationToken = default);
}
