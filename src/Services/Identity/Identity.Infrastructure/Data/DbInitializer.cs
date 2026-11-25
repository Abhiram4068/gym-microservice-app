using System;
using System.Threading.Tasks;
using BCrypt.Net;
using Identity.Domain.Entities;
using Identity.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Identity.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(IdentityDbContext context, ILogger logger)
    {
        try
        {
            var superAdmin = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.SuperAdmin);

            if (superAdmin == null)
            {
                superAdmin = new User
                {
                    Id = Guid.NewGuid(),
                    GymId = null,
                    FirstName = "Super",
                    LastName = "Admin",
                    Email = "admin@gymapp.com",
                    PhoneNumber = "9999999999",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123", 12),
                    Role = UserRole.SuperAdmin,
                    Status = UserStatus.Active,
                    MustChangePassword = false,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(superAdmin);
                await context.SaveChangesAsync();

                logger.LogInformation("Successfully seeded default SuperAdmin user: {Email}", superAdmin.Email);
            }
            else
            {
                logger.LogInformation("Default SuperAdmin user already exists: {Email}", superAdmin.Email);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
