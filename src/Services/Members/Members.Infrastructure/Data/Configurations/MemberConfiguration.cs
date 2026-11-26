using Members.Domain.Entities;
using Members.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Members.Infrastructure.Data.Configurations;

public class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> builder)
    {
        builder.ToTable("Members");

        builder.HasKey(m => m.Id);

        builder.HasQueryFilter(m => m.Status != MemberStatus.Deleted && m.DeletedAt == null);

        builder.Property(m => m.GymId)
            .IsRequired();

        builder.Property(m => m.MemberCode)
            .IsRequired()
            .HasMaxLength(30);

        builder.HasIndex(m => new { m.GymId, m.MemberCode })
            .IsUnique();

        builder.Property(m => m.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(m => new { m.GymId, m.Email })
            .IsUnique();

        builder.Property(m => m.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(m => new { m.GymId, m.PhoneNumber });

        builder.Property(m => m.DateOfBirth)
            .IsRequired(false);

        builder.Property(m => m.Gender)
            .IsRequired(false);

        builder.Property(m => m.ProfileImageUrl)
            .IsRequired(false)
            .HasMaxLength(2048);

        builder.Property(m => m.Address)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(m => m.EmergencyContactName)
            .IsRequired(false)
            .HasMaxLength(100);

        builder.Property(m => m.EmergencyContactPhone)
            .IsRequired(false)
            .HasMaxLength(20);

        builder.Property(m => m.EmergencyContactRelation)
            .IsRequired(false)
            .HasMaxLength(50);

        builder.Property(m => m.JoiningDate)
            .IsRequired();

        builder.Property(m => m.Status)
            .IsRequired()
            .HasDefaultValue(MemberStatus.Pending);

        builder.Property(m => m.CreatedBy)
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSDATETIMEOFFSET()");

        builder.Property(m => m.UpdatedBy)
            .IsRequired(false);

        builder.Property(m => m.UpdatedAt)
            .IsRequired(false);

        builder.Property(m => m.DeletedAt)
            .IsRequired(false);
    }
}
