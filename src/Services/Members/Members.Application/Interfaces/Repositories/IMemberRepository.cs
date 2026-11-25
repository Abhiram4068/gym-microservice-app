using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Members.Domain.Entities;
using Members.Domain.Enums;

namespace Members.Application.Interfaces.Repositories;

public interface IMemberRepository
{
    Task<Member?> GetByIdAndGymIdAsync(Guid id, Guid gymId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Member> Items, int TotalCount)> GetPagedByGymIdAsync(
        Guid gymId,
        string? search,
        Gender? gender,
        BloodGroup? bloodGroup,
        MemberStatus? status,
        string? sortBy,
        string? sortOrder,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(Guid gymId, string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByPhoneNumberAsync(Guid gymId, string phoneNumber, CancellationToken cancellationToken = default);
    Task<bool> ExistsByMemberCodeAsync(Guid gymId, string memberCode, CancellationToken cancellationToken = default);
    Task<int> GetCountByGymIdAsync(Guid gymId, CancellationToken cancellationToken = default);
    Task<Member> AddAsync(Member member, CancellationToken cancellationToken = default);
}
