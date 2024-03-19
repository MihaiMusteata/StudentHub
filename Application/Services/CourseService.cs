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
        Description = JsonSerializer.Serialize(errorDict)
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

  public async Task<List<CourseData>> GetTeacherCourses(int teacherId)
  {
    var courses = await _context.CourseTeachers
      .Where(ct => ct.TeacherId == teacherId)
      .Select(ct => new CourseData
      {
        Id = ct.Course.Id,
        DisciplineId = ct.Course.DisciplineId,
        Name = ct.Course.Name,
        Description = ct.Course.Description,
        Code = ct.Course.Code
      })
      .ToListAsync();
    return courses;
  }

  public async Task<IdentityResult> AssignTeacherToCourse(int courseId, int teacherId)
  {
    var errorDict = new Dictionary<string, string>();
    var course = await _context.Courses.FindAsync(courseId);
    var teacher = await _context.Teachers.FindAsync(teacherId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object)>
    {
      ("Course", course),
      ("Teacher", teacher)
    });
    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var teacherAlreadyAssigned = await _context.CourseTeachers
      .AnyAsync(ct => ct.CourseId == courseId && ct.TeacherId == teacherId);
    errorDict["general"] = "Teacher already assigned to this course";
    
    if (teacherAlreadyAssigned)
    {
      return IdentityResult.Failed(new IdentityError
      {
        Code = "TeacherAlreadyAssigned",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var newCourseTeacher = new CourseTeachersDbTable()
    {
      CourseId = courseId,
      TeacherId = teacherId
    };
    try
    {
      await _context.CourseTeachers.AddAsync(newCourseTeacher);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "adding a teacher to a course");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }


}