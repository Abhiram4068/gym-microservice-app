using System;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using GymPlatform.Common.Security;
using Members.Application.DTOs.Member;
using Members.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Members.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MembersController : ControllerBase
{
    private readonly IMemberService _memberService;

    public MembersController(IMemberService memberService)
    {
        _memberService = memberService;
    }

    /// <summary>
    /// Creates a new member for the authenticated receptionist or gym owner's gym.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "3,2")]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), 400)]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), 409)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMember(
        [FromBody] CreateMemberRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!User.TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<MemberDto>.Unauthorized("Missing or invalid gym identity claim."));
        }

        var currentUserId = User.GetUserId();
        var result = await _memberService.CreateMemberAsync(gymId, currentUserId, request, cancellationToken);

        if (!result.Success)
        {
            return MapError(result);
        }

        return CreatedAtAction(nameof(GetMemberById), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Retrieves a paginated, sorted, filterable, and searchable list of members belonging to the authenticated user's gym.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "3,2")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<MemberDto>>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMembers(
        [FromQuery] GetMembersRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!User.TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<PagedResult<MemberDto>>.Unauthorized("Missing or invalid gym identity claim."));
        }

        var result = await _memberService.GetMembersByGymIdAsync(gymId, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a single member by ID for the authenticated user's gym.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "3,2")]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), 404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMemberById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        if (!User.TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<MemberDto>.Unauthorized("Missing or invalid gym identity claim."));
        }

        var result = await _memberService.GetMemberByIdAsync(gymId, id, cancellationToken);
        if (!result.Success)
        {
            return MapError(result);
        }

        return Ok(result);
    }

    private IActionResult MapError<T>(ApiResponse<T> result) => result.ErrorType switch
    {
        ErrorType.NotFound => NotFound(result),
        ErrorType.Conflict => Conflict(result),
        ErrorType.Unauthorized => Unauthorized(result),
        ErrorType.Forbidden => Forbid(),
        _ => BadRequest(result)
    };
}
