using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class LessonAttendanceService : ILessonAttendanceService
{
  private readonly StudentHubContext _context;
  private readonly ILogger<LessonAssignmentService> _logger;
  public LessonAttendanceService(StudentHubContext context, ILogger<LessonAssignmentService> logger)
  {
    _context = context;
    _logger = logger;
  }

  public async Task<IdentityResult> RecordLessonAttendance(AttendanceData form)
  {
    var errorDict = new Dictionary<string, string>();
    var lessonExists = await _context.CourseLessons.AnyAsync(x => x.Id == form.CourseLessonId);

    _logger.LogInformation("Checking if lesson exists");
    if (!lessonExists)
    {
      errorDict["general"] = "Lesson does not exist";
      _logger.LogError("Lesson does not exist");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "LessonDoesNotExist",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
    _logger.LogInformation("Lesson exists");

    try
    {
      _logger.LogInformation("Trying to record attendance");
      foreach (StudentAttendanceData attendance in form.AttendanceList)
      {
        _logger.LogInformation("Recording attendance for student {studentId} with status {status}", attendance.StudentId, attendance.Status);
        var lessonAttendance = new LessonAttendanceDbTable
        {
          CourseLessonId = form.CourseLessonId,
          StudentId = attendance.StudentId,
          Status = attendance.Status,
          Date = form.Date
        };
        _logger.LogInformation("Adding lesson attendance to context");
        _context.LessonAttendances.Add(lessonAttendance);
      }
      _logger.LogInformation("Saving changes to database");
      await _context.SaveChangesAsync();
      _logger.LogInformation("Attendance recorded successfully");
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      _logger.LogError("Failed to record attendance: {message}", e.Message);
      return IdentityResult.Failed(new IdentityError
      {
        Code = "FailedToRecordAttendance",
        Description = e.Message
      });
    }
  }
}