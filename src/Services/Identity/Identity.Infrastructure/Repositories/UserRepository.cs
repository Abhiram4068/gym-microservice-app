using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Interfaces.Repositories;
using Identity.Domain.Entities;
using Identity.Domain.Enums;
using Identity.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IdentityDbContext _context;

    public UserRepository(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<bool> ExistsByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AnyAsync(u => u.PhoneNumber == phoneNumber, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetGymOwnersPagedAsync(
        string? search,
        UserStatus? status,
        string? sortBy,
        string? sortOrder,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .Include(u => u.Gym)
            .Where(u => u.Role == UserRole.GymOwner);

        // 1. Status Filter
        if (status.HasValue)
        {
            query = query.Where(u => u.Status == status.Value);
        }

        // 2. Search Filter (Owner Name, Email, Phone, Gym Name, Gym Email)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(u =>
                u.FirstName.Contains(term) ||
                u.LastName.Contains(term) ||
                (u.FirstName + " " + u.LastName).Contains(term) ||
                u.Email.Contains(term) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(term)) ||
                (u.Gym != null && u.Gym.Name.Contains(term)) ||
                (u.Gym != null && u.Gym.Email.Contains(term)));
        }

        // 3. Total Count
        var totalCount = await query.CountAsync(cancellationToken);

        // 4. Sorting
        bool isDescending = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);

        query = (sortBy?.ToLowerInvariant()) switch
        {
            "name" or "ownername" => isDescending
                ? query.OrderByDescending(u => u.FirstName).ThenByDescending(u => u.LastName)
                : query.OrderBy(u => u.FirstName).ThenBy(u => u.LastName),
            "gymname" or "gym" => isDescending
                ? query.OrderByDescending(u => u.Gym != null ? u.Gym.Name : string.Empty)
                : query.OrderBy(u => u.Gym != null ? u.Gym.Name : string.Empty),
            "email" => isDescending
                ? query.OrderByDescending(u => u.Email)
                : query.OrderBy(u => u.Email),
            "status" => isDescending
                ? query.OrderByDescending(u => u.Status)
                : query.OrderBy(u => u.Status),
            _ => isDescending
                ? query.OrderByDescending(u => u.CreatedAt)
                : query.OrderBy(u => u.CreatedAt)
        };

        // 5. Pagination
        var page = pageNumber < 1 ? 1 : pageNumber;
        var size = pageSize < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);

        var items = await query
            .AsNoTracking()
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<User?> GetGymOwnerByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.Gym)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.GymOwner, cancellationToken);
    }

    public async Task<User?> GetGymOwnerByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.Gym)
            .FirstOrDefaultAsync(u => (u.Id == id || (u.GymId.HasValue && u.GymId.Value == id)) && u.Role == UserRole.GymOwner, cancellationToken);
    }
}
