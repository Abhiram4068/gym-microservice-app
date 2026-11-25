using System;
using System.Linq;
using System.Security.Claims;

namespace GymPlatform.Common.Security;

/// <summary>
/// Shared helpers for extracting trusted identity and tenant claims from an authenticated <see cref="ClaimsPrincipal"/>.
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Attempts to parse the tenant <c>gymId</c> claim from the authenticated user.
    /// </summary>
    public static bool TryGetGymId(this ClaimsPrincipal? user, out Guid gymId)
    {
        gymId = Guid.Empty;
        if (user == null)
        {
            return false;
        }

        var claim = user.FindFirst("gymId")?.Value
                    ?? user.FindFirst("GymId")?.Value
                    ?? user.Claims.FirstOrDefault(c => c.Type.Equals("gymId", StringComparison.OrdinalIgnoreCase))?.Value;

        return Guid.TryParse(claim, out gymId) && gymId != Guid.Empty;
    }

    /// <summary>
    /// Extracts the authenticated user's <see cref="Guid"/> identifier, or <see cref="Guid.Empty"/> if absent/invalid.
    /// </summary>
    public static Guid GetUserId(this ClaimsPrincipal? user)
    {
        if (user == null)
        {
            return Guid.Empty;
        }

        var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? user.FindFirst("sub")?.Value;

        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }
}
