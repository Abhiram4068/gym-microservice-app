using System;
using Members.Domain.Enums;

namespace Members.Application.DTOs.Member;

public record CreateMemberRequestDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public DateOnly? DateOfBirth { get; init; }
    public Gender? Gender { get; init; }
    public string? ProfileImageUrl { get; init; }
    public string? Address { get; init; }
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactPhone { get; init; }
    public string? EmergencyContactRelation { get; init; }
    public DateOnly? JoiningDate { get; init; }
}
