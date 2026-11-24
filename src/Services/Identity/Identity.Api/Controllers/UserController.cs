using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Request;
using Identity.Application.DTOs.Response;
using Identity.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IGymRegistrationService _gymRegistrationService;

    public UserController(IGymRegistrationService gymRegistrationService)
    {
        _gymRegistrationService = gymRegistrationService;
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
}
