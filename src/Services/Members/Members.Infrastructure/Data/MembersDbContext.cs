using Members.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Members.Infrastructure.Data;

public class MembersDbContext : DbContext
{
    public MembersDbContext(DbContextOptions<MembersDbContext> options) : base(options)
    {
    }

    public DbSet<Member> Members => Set<Member>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MembersDbContext).Assembly);
    }
}
