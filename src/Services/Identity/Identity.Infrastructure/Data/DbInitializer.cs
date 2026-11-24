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
            if (!await context.Users.AnyAsync(u => u.Role == UserRole.SuperAdmin))
            {
                var superAdmin = new User
                {
                    Id = Guid.NewGuid(),
                    GymId = null,
                    FirstName = "Super",
                    LastName = "Admin",
                    Email = "admin@gymapp.com",
                    PhoneNumber = "9999999999",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRole.SuperAdmin,
                    IsActive = true,
                    MustChangePassword = false,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(superAdmin);
                await context.SaveChangesAsync();

                logger.LogInformation("Successfully seeded default SuperAdmin user: {Email}", superAdmin.Email);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
