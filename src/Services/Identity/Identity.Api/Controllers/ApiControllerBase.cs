using GymPlatform.Common.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers;

/// <summary>
/// Base controller providing consistent HTTP status mapping from <see cref="ApiResponse{T}"/>.
/// </summary>
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult FromResult<T>(ApiResponse<T> result)
    {
        if (result.Success)
        {
            return Ok(result);
        }

        return result.ErrorType switch
        {
            ErrorType.NotFound => NotFound(result),
            ErrorType.Unauthorized => Unauthorized(result),
            ErrorType.Forbidden => StatusCode(403, result),
            ErrorType.Conflict => Conflict(result),
            _ => BadRequest(result)
        };
    }
}
