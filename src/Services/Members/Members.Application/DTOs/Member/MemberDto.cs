using System;
using Members.Domain.Enums;

namespace Members.Application.DTOs.Member;

public record MemberDto
{
    public Guid Id { get; init; }
    public Guid GymId { get; init; }
    public string MemberCode { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string Email { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public DateOnly? DateOfBirth { get; init; }
    public Gender? Gender { get; init; }
    public string? GenderName => Gender?.ToString();
    public BloodGroup? BloodGroup { get; init; }
    public string? BloodGroupName => BloodGroup switch
    {
        Domain.Enums.BloodGroup.APositive => "A+",
        Domain.Enums.BloodGroup.ANegative => "A-",
        Domain.Enums.BloodGroup.BPositive => "B+",
        Domain.Enums.BloodGroup.BNegative => "B-",
        Domain.Enums.BloodGroup.ABPositive => "AB+",
        Domain.Enums.BloodGroup.ABNegative => "AB-",
        Domain.Enums.BloodGroup.OPositive => "O+",
        Domain.Enums.BloodGroup.ONegative => "O-",
        _ => null
    };
    public string? Address { get; init; }
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactPhone { get; init; }
    public MemberStatus Status { get; init; }
    public string StatusName => Status.ToString();
    public bool IsActive => Status == MemberStatus.Active;
    public Guid CreatedBy { get; init; }
    public DateTime CreatedAt { get; init; }
}
