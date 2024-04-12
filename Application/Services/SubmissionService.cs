using Application.Contract;
using Application.Interfaces;
using Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class SubmissionService : ISubmissionService
{
  private readonly StudentHubContext _context;
  private readonly ILogger<SubmissionService> _logger;
  public SubmissionService(StudentHubContext context, ILogger<SubmissionService> logger)
  {
    _context = context;
    _logger = logger;
  }

  public async Task<List<StudentSubmissions>?> GetStudentSubmissions(GroupSubmissionsData form)
  {
    var assignmentExists = await _context.LessonAssignments.AnyAsync(x => x.Id == form.AssignmentId);
    var groupExists = await _context.Groups.AnyAsync(x => x.Id == form.GroupId);
    _logger.LogInformation("Checking if assignment and group exist");
    if (!assignmentExists || !groupExists)
    {
      _logger.LogError("Assignment or group does not exist");
      return null;
    }
    _logger.LogInformation("Assignment and group exist");

    _logger.LogInformation("Creating list of students submissions with student id and name");
    var studentsSubmissions = await _context.Students
      .Where(x => x.GroupId == form.GroupId)
      .Select(x => new StudentSubmissions
      {
        StudentId = x.Id,
        StudentName = x.User.FirstName + " " + x.User.LastName
      })
      .ToListAsync();
    _logger.LogInformation("List of students submissions created");

    _logger.LogInformation("Extracting enrolled students for course {courseId}", form.CourseId);
    var enrolledStudents = await _context.EnrolledStudents
      .Where(x => x.CourseId == form.CourseId)
      .Select(x => x.StudentId)
      .ToListAsync();
    _logger.LogInformation("Enrolled students extracted : {enrolledStudents}", enrolledStudents);

    foreach (var student in studentsSubmissions)
    {
      var studentSubmissions = await _context.Submissions
        .Where(x => x.LessonAssignmentId == form.AssignmentId && x.StudentId == student.StudentId)
        .Select(x => new SubmissionData
        {
          Id = x.Id,
          SubmissionDate = x.SubmissionDate,
          DocumentData = new DocumentData
          {
            Id = x.Document.Id,
            Name = x.Document.Name,
            Extension = x.Document.Extension
          },
        })
        .ToListAsync();
      student.Submissions = enrolledStudents.Contains(student.StudentId) ? studentSubmissions : null;
    }
    
    _logger.LogInformation("Students submissions extracted");
    return studentsSubmissions;
  }
}
