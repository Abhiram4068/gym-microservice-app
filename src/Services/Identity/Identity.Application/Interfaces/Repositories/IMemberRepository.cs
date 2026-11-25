using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Identity.Domain.Entities;
using Identity.Domain.Enums;

namespace Identity.Application.Interfaces.Repositories;

public interface IMemberRepository
{
    Task<Member?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Member?> GetByIdAndGymIdAsync(Guid id, Guid gymId, CancellationToken cancellationToken = default);
    Task<List<Member>> GetByGymIdAsync(Guid gymId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Member> Items, int TotalCount)> GetPagedByGymIdAsync(
        Guid gymId,
        string? search,
        Gender? gender,
        BloodGroup? bloodGroup,
        UserStatus? status,
        string? sortBy,
        string? sortOrder,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<bool> ExistsByPhoneNumberAsync(Guid gymId, string phoneNumber, CancellationToken cancellationToken = default);
    Task<bool> ExistsByMemberCodeAsync(Guid gymId, string memberCode, CancellationToken cancellationToken = default);
    Task<int> GetCountByGymIdAsync(Guid gymId, CancellationToken cancellationToken = default);
    Task<Member> AddAsync(Member member, CancellationToken cancellationToken = default);
    Task UpdateAsync(Member member, CancellationToken cancellationToken = default);
}
