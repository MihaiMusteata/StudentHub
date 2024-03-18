using Domain.UniversityTables;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Domain.User;

namespace Infrastructure;

public class StudentHubContext : IdentityDbContext<User>
{
    public StudentHubContext()
    {
    }
    public StudentHubContext(DbContextOptions<StudentHubContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<UniversityDbTable> Universities { get; set; }
    public DbSet<FacultyDbTable> Faculties { get; set; }
    public DbSet<DepartmentDbTable> Departments { get; set; }
    public DbSet<StudentDbTable> Students { get; set; }
    public DbSet<TeacherDbTable> Teachers { get; set; }
    public DbSet<SpecialtyDbTable> Specialties { get; set; }
    public DbSet<DisciplineDbTable> Disciplines { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        //relations
        // modelBuilder.Entity<StudentDbTable>()
        //     .HasOne(s => s.FacultyId)
        //     .WithMany()
        //     .HasForeignKey(s => s.FacultyId);
    }
}