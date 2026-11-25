using System.Threading;
using System.Threading.Tasks;
using GymPlatform.Common.Responses;
using Identity.Application.DTOs.Auth;
using Identity.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService _authService)
    {
        this._authService = _authService;
    }

    [HttpPost("admin-login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), 400)]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), 401)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);

        if (!result.Success)
        {
            if (result.Message == "Validation failed.")
            {
                return BadRequest(result);
            }

            return Unauthorized(result);
        }

        return Ok(result);
    }

    [HttpPost("gym-login")]
    [ProducesResponseType(typeof(ApiResponse<GymLoginResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<GymLoginResponseDto>), 400)]
    [ProducesResponseType(typeof(ApiResponse<GymLoginResponseDto>), 401)]
    public async Task<IActionResult> GymLogin([FromBody] GymLoginRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.GymLoginAsync(request, cancellationToken);

        if (!result.Success)
        {
            if (result.Message == "Validation failed.")
            {
                return BadRequest(result);
            }

            return Unauthorized(result);
        }

        return Ok(result);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponseDto>), 401)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.RefreshTokenAsync(request, cancellationToken);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }
}
