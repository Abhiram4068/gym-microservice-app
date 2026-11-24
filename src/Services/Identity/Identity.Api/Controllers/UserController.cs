using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Receptionist;
using Identity.Application.DTOs.Request;
using Identity.Application.DTOs.Response;
using Identity.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IGymRegistrationService _gymRegistrationService;
    private readonly IUserService _userService;

    public UserController(
        IGymRegistrationService gymRegistrationService,
        IUserService userService,
        IGymOwnerService gymOwnerService)
    {
        _gymRegistrationService = gymRegistrationService;
        _userService = userService;
        _gymOwnerService = gymOwnerService;
    }

    /// <summary>
    /// Registers a new Gym and its corresponding Gym Owner.
    /// Gym is saved in Gyms table and Owner in Users table (Status: Pending, Role: GymOwner).
    /// </summary>
    /// <param name="request">Gym and Owner registration details</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpPost("gym-register")]
    [ProducesResponseType(typeof(ApiResponse<GymRegisterResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<GymRegisterResponseDto>), 400)]
    public async Task<IActionResult> GymRegister([FromBody] GymRegisterRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _gymRegistrationService.RegisterGymAsync(request, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Creates a new Receptionist staff account for the authenticated Gym Owner's gym.
    /// </summary>
    [HttpPost("receptionist")]
    [Authorize(Roles = "GymOwner")]
    [ProducesResponseType(typeof(ApiResponse<ReceptionistDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<ReceptionistDto>), 400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateReceptionist(
        [FromBody] CreateReceptionistRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<ReceptionistDto>.Fail("Missing or invalid gym identity claim."));
        }

        var ownerId = GetCurrentUserId();
        var result = await _userService.CreateReceptionistAsync(ownerId, gymId, request, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
    /// Retrieves a paginated, sorted, filterable, and searchable list of Gym Owners.
    /// Accessible only by SuperAdmin (Admin / Role 1).
    /// </summary>
    /// <param name="request">Pagination, sort, filter, and search query parameters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpGet("gymowners")]
    [Authorize(Roles = "SuperAdmin,1")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<GymOwnerListItemDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<GymOwnerListItemDto>>), 401)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<GymOwnerListItemDto>>), 403)]
    public async Task<IActionResult> GetGymOwners(
        [FromQuery] GetGymOwnersRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _gymOwnerService.GetGymOwnersAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves full details of a specific Gym Owner and their connected Gym by Owner ID.
    /// Accessible only by SuperAdmin (Admin / Role 1).
    /// </summary>
    /// <param name="id">The unique GUID of the Gym Owner</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpGet("gymowners/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,1")]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 400)]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 404)]
    public async Task<IActionResult> GetGymOwnerById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiResponse<GymOwnerDetailDto>.Fail("A valid Gym Owner ID must be provided."));
        }

        var result = await _gymOwnerService.GetGymOwnerByIdAsync(id, cancellationToken);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Lists all receptionists belonging to the authenticated Gym Owner's gym.
    /// </summary>
    [HttpGet("receptionists")]
    [Authorize(Roles = "GymOwner")]
    [ProducesResponseType(typeof(ApiResponse<List<ReceptionistDto>>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetReceptionists(CancellationToken cancellationToken)
    {
        if (!TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<List<ReceptionistDto>>.Fail("Missing or invalid gym identity claim."));
        }

        var result = await _userService.GetReceptionistsByGymIdAsync(gymId, cancellationToken);
    /// Approves a pending or inactive gym owner and activates their account and gym registration.
    /// Accessible only by SuperAdmin (Admin / Role 1).
    /// </summary>
    /// <param name="id">The unique GUID of the Gym Owner or Gym</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpPost("gymowners/{id:guid}/approve")]
    [HttpPut("gymowners/{id:guid}/approve")]
    [Authorize(Roles = "SuperAdmin,1")]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 400)]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 404)]
    public async Task<IActionResult> ApproveGymOwner(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiResponse<GymOwnerDetailDto>.Fail("A valid Gym Owner ID must be provided."));
        }

        var result = await _gymOwnerService.ApproveGymOwnerAsync(id, cancellationToken);
        if (!result.Success)
        {
            if (result.Message != null && result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(result);
            }
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Toggles active/inactive status of a staff user in the authenticated gym.
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "GymOwner")]
    [ProducesResponseType(typeof(ApiResponse<ReceptionistDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<ReceptionistDto>), 400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ToggleUserStatus(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetGymId(out var gymId))
        {
            return Unauthorized(ApiResponse<ReceptionistDto>.Fail("Missing or invalid gym identity claim."));
        }

        var result = await _userService.ToggleUserStatusAsync(gymId, id, cancellationToken);

        if (!result.Success)
        {
    /// Rejects a gym owner's application with an optional rejection reason.
    /// Accessible only by SuperAdmin (Admin / Role 1).
    /// </summary>
    /// <param name="id">The unique GUID of the Gym Owner or Gym</param>
    /// <param name="request">Optional payload containing the rejection reason</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpPost("gymowners/{id:guid}/reject")]
    [HttpPut("gymowners/{id:guid}/reject")]
    [Authorize(Roles = "SuperAdmin,1")]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 400)]
    [ProducesResponseType(typeof(ApiResponse<GymOwnerDetailDto>), 404)]
    public async Task<IActionResult> RejectGymOwner(
        [FromRoute] Guid id,
        [FromBody] RejectGymOwnerRequestDto? request,
        CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return BadRequest(ApiResponse<GymOwnerDetailDto>.Fail("A valid Gym Owner ID must be provided."));
        }

        var result = await _gymOwnerService.RejectGymOwnerAsync(id, request, cancellationToken);
        if (!result.Success)
        {
            if (result.Message != null && result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(result);
            }
            return BadRequest(result);
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
