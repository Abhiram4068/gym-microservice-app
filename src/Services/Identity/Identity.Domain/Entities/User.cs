using System;
using System.Collections.Generic;
using Identity.Domain.Enums;

namespace Identity.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Identifies which gym the user belongs to. NULL for SuperAdmin.
    /// </summary>
    public Guid? GymId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public string? ProfileImageUrl { get; set; }

    public UserStatus Status { get; set; } = UserStatus.Active;

    public bool MustChangePassword { get; set; } = false;

    public DateTime? LastLoginAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public Guid? CreatedBy { get; set; }

    public Guid? UpdatedBy { get; set; }

    // Navigation property: Reference to Gym
    public Gym? Gym { get; set; }

    // Navigation property: One user has many refresh tokens
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
