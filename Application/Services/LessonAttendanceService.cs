using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
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
        _logger.LogInformation("Recording attendance for student {studentId} with status {status}",
          attendance.StudentId,
          attendance.Status);
        _logger.LogInformation("Checking if attendance already recorded for student {studentId}", attendance.StudentId);
        var existingAttendance = await _context.LessonAttendances
          .Where(x => x.CourseLessonId == form.CourseLessonId && x.StudentId == attendance.StudentId &&
                      x.Date == form.Date)
          .FirstOrDefaultAsync();
        if (existingAttendance != null)
        {
          _logger.LogInformation("Attendance already recorded for student {studentId}", attendance.StudentId);
          existingAttendance.Status = attendance.Status;
          _logger.LogInformation("Updating attendance for student {studentId}", attendance.StudentId);
          _context.LessonAttendances.Update(existingAttendance);
          continue;
        }
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

  public async Task<List<StudentAttendanceInfo>?> GetLessonAttendance(GroupAttendanceData form)
  {
    var attendanceInfo = new List<StudentAttendanceInfo>();
    var lessonExists = await _context.CourseLessons.AnyAsync(x => x.Id == form.CourseLessonId);
    var groupExists = await _context.Groups.AnyAsync(x => x.Id == form.GroupId);
    _logger.LogInformation("Checking if lesson and group exist");
    if (!lessonExists || !groupExists)
    {
      return null;
    }
    _logger.LogInformation("Lesson and group exist");

    _logger.LogInformation("Extracting students from group {groupId}", form.GroupId);
    var students = await _context.Students
      .Where(x => x.GroupId == form.GroupId)
      .Select(x => x.Id)
      .ToListAsync();
    _logger.LogInformation("Students extracted : {students}", students);

    _logger.LogInformation("Extracting enrolled students for course {courseId}", form.CourseId);
    var enrolledStudents = await _context.EnrolledStudents
      .Where(x => x.CourseId == form.CourseId)
      .Select(x => x.StudentId)
      .ToListAsync();
    _logger.LogInformation("Enrolled students extracted : {enrolledStudents}", enrolledStudents);

    _logger.LogInformation("Extracting attendance data for lesson {lessonId} on {date}",
      form.CourseLessonId,
      form.Date);
    var studentsAttendance = await _context.LessonAttendances
      .Where(x => x.CourseLessonId == form.CourseLessonId && students.Contains(x.StudentId) && x.Date == form.Date)
      .Select(x => new StudentAttendanceData
      {
        StudentId = x.StudentId,
        Status = x.Status
      })
      .ToListAsync();
    _logger.LogInformation("Attendance data extracted : {attendanceData}", studentsAttendance);

    _logger.LogInformation("Setting up student attendance info");
    foreach (var student in students)
    {
      var studentInfo = _context.Students
        .Where(x => x.Id == student)
        .Select(x => new StudentAttendanceInfo
        {
          Id = x.Id,
          FirstName = x.User.FirstName,
          LastName = x.User.LastName
        })
        .FirstOrDefault();

      studentInfo.Status = studentsAttendance.Any(x => x.StudentId == student)
        ? studentsAttendance.First(x => x.StudentId == student).Status : "Not Recorded";
      studentInfo.Enrolled = enrolledStudents.Contains(student);
      attendanceInfo.Add(studentInfo);
    }
    _logger.LogInformation("Student attendance info set");

    return attendanceInfo;
  }
}