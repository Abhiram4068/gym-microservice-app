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

public class MemberRepository : IMemberRepository
{
    private readonly IdentityDbContext _context;

    public MemberRepository(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<Member?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<Member?> GetByIdAndGymIdAsync(Guid id, Guid gymId, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == id && m.GymId == gymId, cancellationToken);
    }

    public async Task<List<Member>> GetByGymIdAsync(Guid gymId, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .Include(m => m.User)
            .Where(m => m.GymId == gymId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Member> Items, int TotalCount)> GetPagedByGymIdAsync(
        Guid gymId,
        string? search,
        Gender? gender,
        BloodGroup? bloodGroup,
        UserStatus? status,
        string? sortBy,
        string? sortOrder,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Members
            .Include(m => m.User)
            .Where(m => m.GymId == gymId);

        // 1. Filters
        if (gender.HasValue)
        {
            query = query.Where(m => m.Gender == gender.Value);
        }

        if (bloodGroup.HasValue)
        {
            query = query.Where(m => m.BloodGroup == bloodGroup.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(m => m.User != null && m.User.Status == status.Value);
        }

        // 2. Search (Name, User Email, MemberCode, PhoneNumber)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(m =>
                m.FirstName.Contains(term) ||
                m.LastName.Contains(term) ||
                (m.FirstName + " " + m.LastName).Contains(term) ||
                (m.User != null && m.User.Email.Contains(term)) ||
                m.MemberCode.Contains(term) ||
                m.PhoneNumber.Contains(term));
        }

        // 3. Total Count
        var totalCount = await query.CountAsync(cancellationToken);

        // 4. Sorting
        bool isDescending = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);

        query = (sortBy?.ToLowerInvariant()) switch
        {
            "name" or "fullname" => isDescending
                ? query.OrderByDescending(m => m.FirstName).ThenByDescending(m => m.LastName)
                : query.OrderBy(m => m.FirstName).ThenBy(m => m.LastName),
            "email" => isDescending
                ? query.OrderByDescending(m => m.User != null ? m.User.Email : string.Empty)
                : query.OrderBy(m => m.User != null ? m.User.Email : string.Empty),
            "membercode" or "code" => isDescending
                ? query.OrderByDescending(m => m.MemberCode)
                : query.OrderBy(m => m.MemberCode),
            "phonenumber" or "phone" => isDescending
                ? query.OrderByDescending(m => m.PhoneNumber)
                : query.OrderBy(m => m.PhoneNumber),
            "dateofbirth" or "dob" => isDescending
                ? query.OrderByDescending(m => m.DateOfBirth)
                : query.OrderBy(m => m.DateOfBirth),
            "status" => isDescending
                ? query.OrderByDescending(m => m.User != null ? m.User.Status : UserStatus.Inactive)
                : query.OrderBy(m => m.User != null ? m.User.Status : UserStatus.Inactive),
            _ => isDescending
                ? query.OrderByDescending(m => m.CreatedAt)
                : query.OrderBy(m => m.CreatedAt)
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

    public async Task<bool> ExistsByPhoneNumberAsync(Guid gymId, string phoneNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .AnyAsync(m => m.GymId == gymId && m.PhoneNumber == phoneNumber, cancellationToken);
    }

    public async Task<bool> ExistsByMemberCodeAsync(Guid gymId, string memberCode, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .AnyAsync(m => m.GymId == gymId && m.MemberCode == memberCode, cancellationToken);
    }

    public async Task<int> GetCountByGymIdAsync(Guid gymId, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .CountAsync(m => m.GymId == gymId, cancellationToken);
    }

    public async Task<Member> AddAsync(Member member, CancellationToken cancellationToken = default)
    {
        await _context.Members.AddAsync(member, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return member;
    }

    public async Task UpdateAsync(Member member, CancellationToken cancellationToken = default)
    {
        _context.Members.Update(member);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
