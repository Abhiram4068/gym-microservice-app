using System;
using System.Threading;
using System.Threading.Tasks;
using Identity.Domain.Entities;

namespace Identity.Application.Interfaces.Repositories;

public interface IGymRepository
{
    Task<Gym?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Gym?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default);
    Task AddAsync(Gym gym, CancellationToken cancellationToken = default);
    Task UpdateAsync(Gym gym, CancellationToken cancellationToken = default);
}
