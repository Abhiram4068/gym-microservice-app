using System;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces.Repositories;
using Identity.Domain.Entities;
using Identity.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Repositories;

public class GymRepository : IGymRepository
{
    private readonly IdentityDbContext _context;

    public GymRepository(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<Gym?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Gyms
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    public async Task<Gym?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Gyms
            .FirstOrDefaultAsync(g => g.Email == email, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Gyms
            .AnyAsync(g => g.Email == email, cancellationToken);
    }

    public async Task<bool> ExistsByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Gyms
            .AnyAsync(g => g.PhoneNumber == phoneNumber, cancellationToken);
    }

    public async Task AddAsync(Gym gym, CancellationToken cancellationToken = default)
    {
        await _context.Gyms.AddAsync(gym, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Gym gym, CancellationToken cancellationToken = default)
    {
        _context.Gyms.Update(gym);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
