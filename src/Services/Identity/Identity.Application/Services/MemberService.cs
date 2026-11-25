using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Member;
using Identity.Application.Interfaces.Repositories;
using Identity.Application.Interfaces.Services;
using Identity.Domain.Entities;
using Identity.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Identity.Application.Services;

public class MemberService : IMemberService
{
    private readonly IMemberRepository _memberRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IValidator<CreateMemberRequestDto> _validator;
    private readonly ILogger<MemberService> _logger;

    public MemberService(
        IMemberRepository memberRepository,
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IValidator<CreateMemberRequestDto> validator,
        ILogger<MemberService> logger)
    {
        _memberRepository = memberRepository;
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _validator = validator;
        _logger = logger;
    }

    public async Task<ApiResponse<MemberDto>> CreateMemberAsync(
        Guid gymId,
        Guid receptionistId,
        CreateMemberRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.ConvertAll(e => e.ErrorMessage);
            return ApiResponse<MemberDto>.Fail("Validation failed.", errors);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedPhone = request.PhoneNumber.Trim();

        // Check if email already exists in Users table
        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
        {
            return ApiResponse<MemberDto>.Fail($"A user with email '{request.Email}' already exists.");
        }

        // Check if phone number already registered in this gym
        if (await _memberRepository.ExistsByPhoneNumberAsync(gymId, normalizedPhone, cancellationToken))
        {
            return ApiResponse<MemberDto>.Fail($"A member with phone number '{normalizedPhone}' is already registered in this gym.");
        }

        // System-generated MemberCode: MEM-{YYMM}-{SEQ}
        var count = await _memberRepository.GetCountByGymIdAsync(gymId, cancellationToken);
        var memberCode = $"MEM-{DateTime.UtcNow:yyMM}-{(count + 1):D4}";

        if (await _memberRepository.ExistsByMemberCodeAsync(gymId, memberCode, cancellationToken))
        {
            memberCode = $"MEM-{DateTime.UtcNow:yyMM}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
        }

        var now = DateTime.UtcNow;

        // 1. Create User record (holds Email, Role = Member, Status = Active)
        var user = new User
        {
            Id = Guid.NewGuid(),
            GymId = gymId,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedEmail,
            PhoneNumber = normalizedPhone,
            PasswordHash = _passwordHasher.HashPassword(Guid.NewGuid().ToString("N") + "Aa1!"),
            Role = UserRole.Member,
            Status = UserStatus.Active,
            MustChangePassword = true,
            CreatedBy = receptionistId,
            CreatedAt = now
        };

        await _userRepository.AddAsync(user, cancellationToken);

        // 2. Create Member profile record linked via UserId
        var member = new Member
        {
            Id = Guid.NewGuid(),
            GymId = gymId,
            UserId = user.Id,
            MemberCode = memberCode,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PhoneNumber = normalizedPhone,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            BloodGroup = request.BloodGroup,
            Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim(),
            EmergencyContactName = string.IsNullOrWhiteSpace(request.EmergencyContactName) ? null : request.EmergencyContactName.Trim(),
            EmergencyContactPhone = string.IsNullOrWhiteSpace(request.EmergencyContactPhone) ? null : request.EmergencyContactPhone.Trim(),
            CreatedBy = receptionistId,
            CreatedAt = now,
            User = user
        };

        await _memberRepository.AddAsync(member, cancellationToken);

        _logger.LogInformation("Member {MemberId} ({MemberCode}) and User {UserId} created for Gym {GymId} by Receptionist {ReceptionistId}",
            member.Id, member.MemberCode, user.Id, gymId, receptionistId);

        var dto = MapToDto(member);
        return ApiResponse<MemberDto>.Ok(dto, "Member registered successfully.");
    }

    public async Task<ApiResponse<PagedResult<MemberDto>>> GetMembersByGymIdAsync(
        Guid gymId,
        GetMembersRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize < 1 ? 10 : (request.PageSize > 100 ? 100 : request.PageSize);

        var (members, totalCount) = await _memberRepository.GetPagedByGymIdAsync(
            gymId,
            request.Search,
            request.Gender,
            request.BloodGroup,
            request.Status,
            request.SortBy,
            request.SortOrder,
            pageNumber,
            pageSize,
            cancellationToken);

        var dtos = members.Select(MapToDto).ToList();
        var pagedResult = PagedResult<MemberDto>.Create(dtos, totalCount, pageNumber, pageSize);

        _logger.LogInformation("Retrieved {Count} members for Gym {GymId} (Page {PageNumber}/{TotalPages}, Total: {TotalCount})",
            dtos.Count, gymId, pagedResult.PageNumber, pagedResult.TotalPages, totalCount);

        return ApiResponse<PagedResult<MemberDto>>.Ok(pagedResult, "Members retrieved successfully.");
    }

    public async Task<ApiResponse<MemberDto>> GetMemberByIdAsync(
        Guid gymId,
        Guid memberId,
        CancellationToken cancellationToken = default)
    {
        var member = await _memberRepository.GetByIdAndGymIdAsync(memberId, gymId, cancellationToken);
        if (member == null)
        {
            return ApiResponse<MemberDto>.Fail("Member not found.");
        }

        return ApiResponse<MemberDto>.Ok(MapToDto(member), "Member retrieved successfully.");
    }

    private static MemberDto MapToDto(Member m) => new()
    {
        Id = m.Id,
        GymId = m.GymId,
        UserId = m.UserId,
        MemberCode = m.MemberCode,
        FirstName = m.FirstName,
        LastName = m.LastName,
        Email = m.User?.Email,
        PhoneNumber = m.PhoneNumber,
        DateOfBirth = m.DateOfBirth,
        Gender = m.Gender,
        BloodGroup = m.BloodGroup,
        Address = m.Address,
        EmergencyContactName = m.EmergencyContactName,
        EmergencyContactPhone = m.EmergencyContactPhone,
        CreatedBy = m.CreatedBy,
        CreatedAt = m.CreatedAt,
        Status = m.User?.Status ?? UserStatus.Active
    };
}
