using System;

namespace Identity.Application.DTOs.Auth;

public class GymUserDto
{
    public Guid Id { get; set; }
    public Guid GymId { get; set; }
    public string GymName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public int Role { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
}
