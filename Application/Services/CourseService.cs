using System.Text.Json;
using Application.Contract;
using Application.Helpers;
using Application.Interfaces;
using Application.Resources;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class CourseService : ICourseService
{
  private readonly StudentHubContext _context;

  public CourseService(StudentHubContext context)
  {
    _context = context;
  }

  public async Task<IdentityResult> CreateCourse(CourseData courseData)
  {
    var errorDict = new Dictionary<string, string>();

    var courseExists = await _context.Courses.AnyAsync(c => c.Name == courseData.Name);
    if (courseExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Course with this name");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "CourseExists",
        Description = "Course with this name already exists"
      });
    }

    var discipline = await _context.Disciplines.FindAsync(courseData.DisciplineId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object)>
    {
      ("Discipline", discipline)
    });
    
    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var newCourse = new CourseDbTable()
    {
      Id = courseData.Id,
      Name = courseData.Name,
      Description = courseData.Description,
      DisciplineId = courseData.DisciplineId,
      Code = courseData.Code
    };
    try
    {
      await _context.Courses.AddAsync(newCourse);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "creating a new course");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

}