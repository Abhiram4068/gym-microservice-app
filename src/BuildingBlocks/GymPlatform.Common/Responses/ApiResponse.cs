using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace GymPlatform.Common.Responses;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    [JsonIgnore]
    public ErrorType ErrorType { get; set; } = ErrorType.None;

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message, ErrorType = ErrorType.None };

    public static ApiResponse<T> Fail(
        string message,
        List<string>? errors = null,
        ErrorType errorType = ErrorType.Validation) =>
        new() { Success = false, Message = message, Errors = errors, ErrorType = errorType };

    public static ApiResponse<T> ValidationFail(string message, List<string>? errors = null) =>
        Fail(message, errors, ErrorType.Validation);

    public static ApiResponse<T> NotFound(string message) =>
        Fail(message, null, ErrorType.NotFound);

    public static ApiResponse<T> Unauthorized(string message) =>
        Fail(message, null, ErrorType.Unauthorized);

    public static ApiResponse<T> Conflict(string message, List<string>? errors = null) =>
        Fail(message, errors, ErrorType.Conflict);
}
