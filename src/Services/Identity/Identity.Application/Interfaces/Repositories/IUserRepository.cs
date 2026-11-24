using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Identity.Domain.Entities;
using Identity.Domain.Enums;

namespace Identity.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailWithGymAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAndGymIdAsync(Guid id, Guid gymId, CancellationToken cancellationToken = default);
    Task<List<User>> GetReceptionistsByGymIdAsync(Guid gymId, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<User> Items, int TotalCount)> GetGymOwnersPagedAsync(
        string? search,
        UserStatus? status,
        string? sortBy,
        string? sortOrder,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<User?> GetGymOwnerByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetGymOwnerByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
}
