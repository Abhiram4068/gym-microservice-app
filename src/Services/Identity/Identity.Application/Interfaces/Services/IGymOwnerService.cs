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
}
