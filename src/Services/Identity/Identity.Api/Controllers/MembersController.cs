using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Member;
using Identity.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers;

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
    /// Creates a new customer / member for the receptionist's gym.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Receptionist,GymOwner,2,3")]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), 400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMember(
        [FromBody] CreateMemberRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<MemberDto>.Fail("Missing or invalid gym identity claim."));
        }

        var currentUserId = GetCurrentUserId();
        var result = await _memberService.CreateMemberAsync(gymId, currentUserId, request, cancellationToken);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Retrieves a paginated, sorted, filterable, and searchable list of members belonging to the authenticated receptionist's gym.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Receptionist,GymOwner,2,3")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<MemberDto>>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMembers(
        [FromQuery] GetMembersRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<PagedResult<MemberDto>>.Fail("Missing or invalid gym identity claim."));
        }

        var result = await _memberService.GetMembersByGymIdAsync(gymId, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a single member by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Receptionist,GymOwner,2,3")]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMemberById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<MemberDto>.Fail("Missing or invalid gym identity claim."));
        }

        var result = await _memberService.GetMemberByIdAsync(gymId, id, cancellationToken);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    private bool TryGetGymId(out Guid gymId)
    {
        gymId = Guid.Empty;
        var claim = User.FindFirst("gymId")?.Value 
                    ?? User.FindFirst("GymId")?.Value
                    ?? System.Linq.Enumerable.FirstOrDefault(User.Claims, c => c.Type.Equals("gymId", StringComparison.OrdinalIgnoreCase))?.Value;
        return Guid.TryParse(claim, out gymId);
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }
}
