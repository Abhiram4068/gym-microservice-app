using System;

namespace Identity.Application.DTOs.Auth;

public class UserDto
{
    public Guid Id { get; set; }
    public Guid? GymId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public int Role { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
}
