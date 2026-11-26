using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using GymPlatform.Common.Messaging;
using GymPlatform.Common.Pagination;
using GymPlatform.Common.Responses;
using GymPlatform.Contracts.Events;
using Members.Application.DTOs.Member;
using Members.Application.Interfaces.Repositories;
using Members.Application.Interfaces.Services;
using Members.Domain.Entities;
using Members.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Members.Application.Services;

public class MemberService : IMemberService
{
    private readonly IMemberRepository _memberRepository;
    private readonly IValidator<CreateMemberRequestDto> _validator;
    private readonly IEventBus _eventBus;
    private readonly ILogger<MemberService> _logger;

    public MemberService(
        IMemberRepository memberRepository,
        IValidator<CreateMemberRequestDto> validator,
        IEventBus eventBus,
        ILogger<MemberService> logger)
    {
        _memberRepository = memberRepository;
        _validator = validator;
        _eventBus = eventBus;
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
            return ApiResponse<MemberDto>.ValidationFail("Validation failed.", errors);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedPhone = request.PhoneNumber.Trim();

        if (await _memberRepository.ExistsByEmailAsync(gymId, normalizedEmail, cancellationToken))
        {
            return ApiResponse<MemberDto>.Conflict($"A member with email '{request.Email}' is already registered in this gym.");
        }

        if (await _memberRepository.ExistsByPhoneNumberAsync(gymId, normalizedPhone, cancellationToken))
        {
            return ApiResponse<MemberDto>.Conflict($"A member with phone number '{normalizedPhone}' is already registered in this gym.");
        }

        var memberCode = await GenerateUniqueMemberCodeAsync(gymId, cancellationToken);

        var member = new Member
        {
            Id = Guid.NewGuid(),
            GymId = gymId,
            MemberCode = memberCode,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedEmail,
            PhoneNumber = normalizedPhone,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            ProfileImageUrl = string.IsNullOrWhiteSpace(request.ProfileImageUrl) ? null : request.ProfileImageUrl.Trim(),
            Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim(),
            EmergencyContactName = string.IsNullOrWhiteSpace(request.EmergencyContactName) ? null : request.EmergencyContactName.Trim(),
            EmergencyContactPhone = string.IsNullOrWhiteSpace(request.EmergencyContactPhone) ? null : request.EmergencyContactPhone.Trim(),
            EmergencyContactRelation = string.IsNullOrWhiteSpace(request.EmergencyContactRelation) ? null : request.EmergencyContactRelation.Trim(),
            JoiningDate = request.JoiningDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            Status = MemberStatus.Pending,
            CreatedBy = receptionistId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _memberRepository.AddAsync(member, cancellationToken);

        await _eventBus.PublishAsync(
            new MemberRegisteredV1(
                EventId: Guid.NewGuid(),
                OccurredAtUtc: DateTimeOffset.UtcNow,
                GymId: member.GymId,
                MemberId: member.Id,
                MemberCode: member.MemberCode,
                FullName: $"{member.FirstName} {member.LastName}",
                Email: member.Email,
                PhoneNumber: member.PhoneNumber),
            cancellationToken);

        _logger.LogInformation("Member {MemberId} ({MemberCode}) created for Gym {GymId} by User {UserId}",
            member.Id, member.MemberCode, gymId, receptionistId);

        return ApiResponse<MemberDto>.Ok(MapToDto(member), "Member registered successfully.");
    }

    public async Task<ApiResponse<PagedResult<MemberDto>>> GetMembersByGymIdAsync(
        Guid gymId,
        GetMembersRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var (pageNumber, pageSize) = PaginationHelper.Normalize(request.PageNumber, request.PageSize);

        var (members, totalCount) = await _memberRepository.GetPagedByGymIdAsync(
            gymId,
            request.Search,
            request.Gender,
            request.Status,
            request.SortBy,
            request.SortOrder,
            pageNumber,
            pageSize,
            cancellationToken);

        var dtos = members.Select(MapToDto).ToList();
        var pagedResult = PagedResult<MemberDto>.Create(dtos, totalCount, pageNumber, pageSize);

        return ApiResponse<PagedResult<MemberDto>>.Ok(pagedResult, "Members retrieved successfully.");
    }

    public async Task<ApiResponse<MemberDto>> GetMemberByIdAsync(
        Guid gymId,
        Guid memberId,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
        {
            return ApiResponse<MemberDto>.ValidationFail("A valid Member ID must be provided.");
        }

        var member = await _memberRepository.GetByIdAndGymIdAsync(memberId, gymId, cancellationToken);
        if (member == null)
        {
            return ApiResponse<MemberDto>.NotFound("Member not found.");
        }

        return ApiResponse<MemberDto>.Ok(MapToDto(member), "Member retrieved successfully.");
    }

    private async Task<string> GenerateUniqueMemberCodeAsync(Guid gymId, CancellationToken cancellationToken)
    {
        var count = await _memberRepository.GetCountByGymIdAsync(gymId, cancellationToken);
        var code = $"MEM-{DateTime.UtcNow:yyMM}-{(count + 1):D4}";

        if (await _memberRepository.ExistsByMemberCodeAsync(gymId, code, cancellationToken))
        {
            code = $"MEM-{DateTime.UtcNow:yyMM}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
        }

        return code;
    }

    private static MemberDto MapToDto(Member m) => new()
    {
        Id = m.Id,
        GymId = m.GymId,
        MemberCode = m.MemberCode,
        FirstName = m.FirstName,
        LastName = m.LastName,
        Email = m.Email,
        PhoneNumber = m.PhoneNumber,
        DateOfBirth = m.DateOfBirth,
        Gender = m.Gender,
        ProfileImageUrl = m.ProfileImageUrl,
        Address = m.Address,
        EmergencyContactName = m.EmergencyContactName,
        EmergencyContactPhone = m.EmergencyContactPhone,
        EmergencyContactRelation = m.EmergencyContactRelation,
        JoiningDate = m.JoiningDate,
        Status = m.Status,
        CreatedBy = m.CreatedBy,
        CreatedAt = m.CreatedAt,
        UpdatedBy = m.UpdatedBy,
        UpdatedAt = m.UpdatedAt
    };
}
