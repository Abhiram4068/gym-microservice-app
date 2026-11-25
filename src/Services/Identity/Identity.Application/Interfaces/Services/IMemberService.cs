using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Member;

namespace Identity.Application.Interfaces.Services;

public interface IMemberService
{
    Task<ApiResponse<MemberDto>> CreateMemberAsync(
        Guid gymId,
        Guid receptionistId,
        CreateMemberRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<PagedResult<MemberDto>>> GetMembersByGymIdAsync(
        Guid gymId,
        GetMembersRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ApiResponse<MemberDto>> GetMemberByIdAsync(
        Guid gymId,
        Guid memberId,
        CancellationToken cancellationToken = default);
}
