using System;

namespace GymPlatform.Contracts.Events;

/// <summary>
/// Published when a new member profile is registered in a gym.
/// </summary>
public sealed record MemberRegisteredV1(
    Guid EventId,
    DateTimeOffset OccurredAtUtc,
    Guid GymId,
    Guid MemberId,
    string MemberCode,
    string FullName,
    string Email,
    string PhoneNumber);
