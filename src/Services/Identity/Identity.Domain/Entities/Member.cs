using System;
using Identity.Domain.Enums;

namespace Identity.Domain.Entities;

public class Member
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid GymId { get; set; }

    public Guid UserId { get; set; }

    public string MemberCode { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }

    public Gender? Gender { get; set; }

    public BloodGroup? BloodGroup { get; set; }

    public string? Address { get; set; }

    public string? EmergencyContactName { get; set; }

    public string? EmergencyContactPhone { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property: Reference to Gym
    public Gym? Gym { get; set; }

    // Navigation property: Reference to User (holds Email, PasswordHash, Role, Status)
    public User? User { get; set; }
}
