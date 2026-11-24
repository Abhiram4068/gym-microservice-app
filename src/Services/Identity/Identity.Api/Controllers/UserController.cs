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
}
