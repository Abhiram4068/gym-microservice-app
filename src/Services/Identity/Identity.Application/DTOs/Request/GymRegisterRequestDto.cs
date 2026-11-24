using System.ComponentModel.DataAnnotations;

namespace Identity.Application.DTOs.Request;

public class GymRegisterRequestDto
{
    // Gym Business Information
    public string GymName { get; set; } = string.Empty;
    public string? GymRegistrationNumber { get; set; }
    public string GymEmail { get; set; } = string.Empty;
    public string GymPhoneNumber { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string? State { get; set; }
    public string? Country { get; set; }
    public string PinCode { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }

    // Gym Owner Account Information
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public string? OwnerPhoneNumber { get; set; }
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
