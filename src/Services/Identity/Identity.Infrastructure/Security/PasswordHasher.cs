using BCrypt.Net;
using Identity.Application.Interfaces.Services;

namespace Identity.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
        {
            return false;
        }

        try
        {
            if (BCrypt.Net.BCrypt.Verify(password, passwordHash))
            {
                return true;
            }
        }
        catch
        {
            // Fall back to EnhancedVerify if hash was created using EnhancedHashPassword
        }

        try
        {
            if (BCrypt.Net.BCrypt.EnhancedVerify(password, passwordHash))
            {
                return true;
            }
        }
        catch
        {
            // Ignored
        }

        return false;
    }
}
