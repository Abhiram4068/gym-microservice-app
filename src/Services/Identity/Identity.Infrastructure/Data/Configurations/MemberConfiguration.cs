using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Identity.Infrastructure.Data.Configurations;

public class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> builder)
    {
        builder.ToTable("Members");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.GymId)
            .IsRequired();

        builder.Property(m => m.UserId)
            .IsRequired();

        builder.HasIndex(m => m.UserId)
            .IsUnique();

        builder.Property(m => m.MemberCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(m => new { m.GymId, m.MemberCode })
            .IsUnique();

        builder.Property(m => m.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.PhoneNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.HasIndex(m => new { m.GymId, m.PhoneNumber });

        builder.Property(m => m.DateOfBirth)
            .IsRequired(false);

        builder.Property(m => m.Gender)
            .IsRequired(false);

        builder.Property(m => m.BloodGroup)
            .IsRequired(false);

        builder.Property(m => m.Address)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(m => m.EmergencyContactName)
            .IsRequired(false)
            .HasMaxLength(150);

        builder.Property(m => m.EmergencyContactPhone)
            .IsRequired(false)
            .HasMaxLength(30);

        builder.Property(m => m.CreatedBy)
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(m => m.Gym)
            .WithMany(g => g.Members)
            .HasForeignKey(m => m.GymId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.User)
            .WithOne(u => u.Member)
            .HasForeignKey<Member>(m => m.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
