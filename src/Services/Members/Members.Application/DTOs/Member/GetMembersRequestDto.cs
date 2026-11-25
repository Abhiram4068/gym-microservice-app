using Members.Domain.Enums;

namespace Members.Application.DTOs.Member;

public record GetMembersRequestDto
{
    public string? Search { get; init; }
    public Gender? Gender { get; init; }
    public BloodGroup? BloodGroup { get; init; }
    public MemberStatus? Status { get; init; }
    public string? SortBy { get; init; } = "CreatedAt";
    public string? SortOrder { get; init; } = "desc";
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
