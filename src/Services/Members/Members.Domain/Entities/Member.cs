using System;
using Members.Domain.Enums;

namespace Members.Domain.Entities;

public class Member
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid GymId { get; set; }

    public string MemberCode { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }

    public Gender? Gender { get; set; }

    public BloodGroup? BloodGroup { get; set; }

    public string? Address { get; set; }

    public string? EmergencyContactName { get; set; }

    public string? EmergencyContactPhone { get; set; }

    public MemberStatus Status { get; set; } = MemberStatus.Active;

    public Guid CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
