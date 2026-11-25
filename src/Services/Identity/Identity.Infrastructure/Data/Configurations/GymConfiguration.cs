using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Identity.Infrastructure.Data.Configurations;

public class GymConfiguration : IEntityTypeConfiguration<Gym>
{
    public void Configure(EntityTypeBuilder<Gym> builder)
    {
        builder.ToTable("Gyms");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(g => g.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(g => g.Email)
            .IsUnique();

        builder.Property(g => g.PhoneNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(g => g.AddressLine1)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(g => g.AddressLine2)
            .IsRequired(false)
            .HasMaxLength(300);

        builder.Property(g => g.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(g => g.State)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(g => g.Country)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(g => g.PinCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(g => g.WebsiteUrl)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(g => g.LogoUrl)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(g => g.RejectionReason)
            .IsRequired(false)
            .HasMaxLength(1000);

        builder.Property(g => g.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(g => g.UpdatedAt)
            .IsRequired(false);

        // One Gym has Many Users
        builder.HasMany(g => g.Users)
            .WithOne(u => u.Gym)
            .HasForeignKey(u => u.GymId)
            .OnDelete(DeleteBehavior.Restrict);

        // One Gym has Many Members
        builder.HasMany(g => g.Members)
            .WithOne(m => m.Gym)
            .HasForeignKey(m => m.GymId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
