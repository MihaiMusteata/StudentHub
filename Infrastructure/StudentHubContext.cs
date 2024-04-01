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
    public DbSet<GroupDbTable> Groups { get; set; }
    public DbSet<CourseDbTable> Courses { get; set; }
    public DbSet<CourseAccessKeyDbTable> CourseAccessKeys { get; set; }
    public DbSet<CourseLessonDbTable> CourseLessons { get; set; }
    public DbSet<LessonAttendanceDbTable> LessonAttendances { get; set; }
    public DbSet<CourseTeachersDbTable> CourseTeachers { get; set; }
    public DbSet<DocumentDbTable> Documents { get; set; }
    public DbSet<SubmissionDbTable> Submissions { get; set; }
    public DbSet<LessonAssignmentDbTable> LessonAssignments { get; set; }
    public DbSet<LessonResourceDbTable> LessonResources { get; set; }
    public DbSet<EnrolledStudentsDbTable> EnrolledStudents { get; set; }
    
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}