using System.Text.Json;
using Application.Contract;
using Application.Helpers;
using Application.Interfaces;
using Application.Resources;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class GradesService : IGradesService
{
  private readonly StudentHubContext _context;
  private readonly ILogger<GradesService> _logger;
  public GradesService(ILogger<GradesService> logger, StudentHubContext context)
  {
    _logger = logger;
    _context = context;
  }

  public async Task<IdentityResult> GradeStudent(GradeInfo grade)
  {
    _logger.LogInformation("Grading a student.");
    var errorDict = new Dictionary<string, string>();
    
    var assignment = await _context.LessonAssignments.FindAsync(grade.AssignmentId);
    
    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Assignment", assignment)
    });
    
    if (!checkResult.Succeeded)
    {
      return checkResult;
    }
    
    var existingGrade = await _context.Grades
      .Where(g => g.AssignmentId == grade.AssignmentId && g.StudentId == grade.StudentId)
      .FirstOrDefaultAsync();
    
    var newGrade = new GradeDbTable
    {
      AssignmentId = grade.AssignmentId,
      StudentId = grade.StudentId,
      Grade = grade.Grade,
      TeacherName = grade.TeacherName
    };
    
    _logger.LogInformation("Checking if the student is already graded.");
    if (existingGrade is not null)
    {
      existingGrade.Grade = grade.Grade;
      existingGrade.TeacherName = grade.TeacherName;
      _logger.LogInformation("Student already graded.");
      _context.Entry(existingGrade).State = EntityState.Modified;
      _context.Grades.Update(existingGrade);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    _logger.LogInformation("Student not graded yet.");
    

    _logger.LogInformation("Trying to grade the student.");
    try
    {
      await _context.Grades.AddAsync(newGrade);
      await _context.SaveChangesAsync();
      _logger.LogInformation("Student graded successfully.");
      return IdentityResult.Success;
    }
    catch(Exception e)
    {
      _logger.LogError("Error grading the student. : {e.Message}",e);
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "grading the student");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }
}