using System;

namespace Identity.Application.DTOs.Response;

public class GymRegisterResponseDto
{
    public Guid GymId { get; set; }
    public string GymName { get; set; } = string.Empty;
    public string GymEmail { get; set; } = string.Empty;
    public string GymStatus { get; set; } = string.Empty;

    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    public DateTime RegisteredAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
