using System;
using System.Collections.Generic;
using Identity.Domain.Enums;

namespace Identity.Domain.Entities;

public class Gym
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string AddressLine1 { get; set; } = string.Empty;

    public string? AddressLine2 { get; set; }

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string Country { get; set; } = string.Empty;

    public string PinCode { get; set; } = string.Empty;

    public string? WebsiteUrl { get; set; }

    public string? LogoUrl { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation property: One gym has many users (GymOwner, Receptionist, Trainer)
    public ICollection<User> Users { get; set; } = new List<User>();

    // Navigation property: One gym has many members
    public ICollection<Member> Members { get; set; } = new List<Member>();
}
