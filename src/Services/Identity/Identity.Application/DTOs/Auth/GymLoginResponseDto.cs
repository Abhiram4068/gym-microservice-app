namespace Identity.Application.DTOs.Auth;

public class GymLoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public GymUserDto User { get; set; } = null!;
}
