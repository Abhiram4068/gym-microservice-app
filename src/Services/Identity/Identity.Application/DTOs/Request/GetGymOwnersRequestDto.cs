using Identity.Domain.Enums;

namespace Identity.Application.DTOs.Request;

public class GetGymOwnersRequestDto
{
    public string? Search { get; set; }
    public UserStatus? Status { get; set; }
    public string? SortBy { get; set; } = "CreatedAt";
    public string? SortOrder { get; set; } = "desc";
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
