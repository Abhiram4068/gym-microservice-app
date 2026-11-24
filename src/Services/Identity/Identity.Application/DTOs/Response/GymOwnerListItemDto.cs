using System;
using Identity.Domain.Enums;

namespace Identity.Application.DTOs.Response;

public class GymOwnerListItemDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public UserStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Gym Business Information
    public Guid? GymId { get; set; }
    public string? GymName { get; set; }
    public string? GymEmail { get; set; }
    public string? GymPhoneNumber { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
}
