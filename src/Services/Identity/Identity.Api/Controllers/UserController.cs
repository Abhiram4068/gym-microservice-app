using System;
using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
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
    private readonly IGymOwnerService _gymOwnerService;

    public UserController(
        IGymRegistrationService gymRegistrationService,
        IGymOwnerService gymOwnerService)
    {
        _gymRegistrationService = gymRegistrationService;
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
}
