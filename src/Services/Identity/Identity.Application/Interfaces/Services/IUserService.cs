using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Receptionist;

namespace Identity.Application.Interfaces.Services;

public interface IUserService
{
    Task<ApiResponse<ReceptionistDto>> CreateReceptionistAsync(Guid ownerId, Guid gymId, CreateReceptionistRequestDto request, CancellationToken cancellationToken = default);
    Task<ApiResponse<List<ReceptionistDto>>> GetReceptionistsByGymIdAsync(Guid gymId, CancellationToken cancellationToken = default);
    Task<ApiResponse<ReceptionistDto>> ToggleUserStatusAsync(Guid gymId, Guid userId, CancellationToken cancellationToken = default);
}
