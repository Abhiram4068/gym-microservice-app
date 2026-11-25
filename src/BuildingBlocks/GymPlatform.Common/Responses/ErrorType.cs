namespace GymPlatform.Common.Responses;

/// <summary>
/// Categorizes application-level errors for consistent HTTP status mapping in API controllers.
/// </summary>
public enum ErrorType
{
    None = 0,
    Validation = 1,
    NotFound = 2,
    Unauthorized = 3,
    Forbidden = 4,
    Conflict = 5
}
