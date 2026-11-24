using System;
using Identity.Domain.Entities;

namespace Identity.Application.Interfaces.Services;

public interface IJwtTokenGenerator
{
    (string Token, int ExpiresIn) GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(User user);
}
