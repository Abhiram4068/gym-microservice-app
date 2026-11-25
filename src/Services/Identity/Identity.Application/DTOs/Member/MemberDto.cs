using System;
using Identity.Domain.Enums;

namespace Identity.Application.DTOs.Member;

public class MemberDto
{
    public Guid Id { get; set; }
    public Guid GymId { get; set; }
    public Guid UserId { get; set; }
    public string MemberCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string? Email { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public Gender? Gender { get; set; }
    public string? GenderName => Gender?.ToString();
    public BloodGroup? BloodGroup { get; set; }
    public string? BloodGroupName => BloodGroup switch
    {
        Identity.Domain.Enums.BloodGroup.APositive => "A+",
        Identity.Domain.Enums.BloodGroup.ANegative => "A-",
        Identity.Domain.Enums.BloodGroup.BPositive => "B+",
        Identity.Domain.Enums.BloodGroup.BNegative => "B-",
        Identity.Domain.Enums.BloodGroup.ABPositive => "AB+",
        Identity.Domain.Enums.BloodGroup.ABNegative => "AB-",
        Identity.Domain.Enums.BloodGroup.OPositive => "O+",
        Identity.Domain.Enums.BloodGroup.ONegative => "O-",
        _ => null
    };
    public string? Address { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public bool IsActive => Status == UserStatus.Active;
}
