using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Pagination;
using Members.Application.Interfaces.Repositories;
using Members.Domain.Entities;
using Members.Domain.Enums;
using Members.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Members.Infrastructure.Repositories;

public class MemberRepository : IMemberRepository
{
    private readonly MembersDbContext _context;

    public MemberRepository(MembersDbContext context)
    {
        _context = context;
    }

    public async Task<Member?> GetByIdAndGymIdAsync(Guid id, Guid gymId, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id && m.GymId == gymId, cancellationToken);
    }

    public async Task<(IReadOnlyList<Member> Items, int TotalCount)> GetPagedByGymIdAsync(
        Guid gymId,
        string? search,
        Gender? gender,
        MemberStatus? status,
        string? sortBy,
        string? sortOrder,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Members
            .Where(m => m.GymId == gymId);

        if (gender.HasValue)
        {
            query = query.Where(m => m.Gender == gender.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(m =>
                m.FirstName.Contains(term) ||
                m.LastName.Contains(term) ||
                (m.FirstName + " " + m.LastName).Contains(term) ||
                m.Email.Contains(term) ||
                m.MemberCode.Contains(term) ||
                m.PhoneNumber.Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        bool isDescending = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);

        query = (sortBy?.ToLowerInvariant()) switch
        {
            "name" or "fullname" => isDescending
                ? query.OrderByDescending(m => m.FirstName).ThenByDescending(m => m.LastName)
                : query.OrderBy(m => m.FirstName).ThenBy(m => m.LastName),
            "email" => isDescending
                ? query.OrderByDescending(m => m.Email)
                : query.OrderBy(m => m.Email),
            "membercode" or "code" => isDescending
                ? query.OrderByDescending(m => m.MemberCode)
                : query.OrderBy(m => m.MemberCode),
            "phonenumber" or "phone" => isDescending
                ? query.OrderByDescending(m => m.PhoneNumber)
                : query.OrderBy(m => m.PhoneNumber),
            "dateofbirth" or "dob" => isDescending
                ? query.OrderByDescending(m => m.DateOfBirth)
                : query.OrderBy(m => m.DateOfBirth),
            "joiningdate" => isDescending
                ? query.OrderByDescending(m => m.JoiningDate)
                : query.OrderBy(m => m.JoiningDate),
            "status" => isDescending
                ? query.OrderByDescending(m => m.Status)
                : query.OrderBy(m => m.Status),
            _ => isDescending
                ? query.OrderByDescending(m => m.CreatedAt)
                : query.OrderBy(m => m.CreatedAt)
        };

        var (page, size) = PaginationHelper.Normalize(pageNumber, pageSize);

        var items = await query
            .AsNoTracking()
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<bool> ExistsByEmailAsync(Guid gymId, string email, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .AnyAsync(m => m.GymId == gymId && m.Email == email, cancellationToken);
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
            .IgnoreQueryFilters()
            .CountAsync(m => m.GymId == gymId, cancellationToken);
    }

    public async Task<Member> AddAsync(Member member, CancellationToken cancellationToken = default)
    {
        await _context.Members.AddAsync(member, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return member;
    }
}
