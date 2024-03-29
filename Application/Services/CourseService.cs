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

  public async Task<IdentityResult> CreateCourse(CourseForm courseData)
  {
    var errorDict = new Dictionary<string, string>();
  
    var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == courseData.UserId);
    var discipline = await _context.Disciplines.FindAsync(courseData.DisciplineId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Discipline", discipline),
      ("Teacher", teacher)
    });
    
    var courseExists = await _context.CourseTeachers
      .AnyAsync(ct => ct.Course.Code == courseData.Code && ct.Course.Name == courseData.Name && ct.TeacherId == teacher!.Id);
    
    if (courseExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Course with this name");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "CourseExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }


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
      var assignTeacherResult = await AssignTeacherToCourse(newCourse.Id, teacher!.Id);
      if (!assignTeacherResult.Succeeded)
      {
        _context.Entry(newCourse).State = EntityState.Deleted;
        await _context.SaveChangesAsync();
        return assignTeacherResult;
      }
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

  public async Task<IdentityResult> AssignTeacherToCourse(int courseId, int teacherId)
  {
    var errorDict = new Dictionary<string, string>();
    var course = await _context.Courses.FindAsync(courseId);
    var teacher = await _context.Teachers.FindAsync(teacherId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
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

  public async Task<List<string>> GetEnrolledGroups(int courseId)
  {
    var groups = await _context.CourseAccessKeys
      .Where(cak => cak.CourseId == courseId)
      .Select(cak => cak.Group.Name)
      .Distinct()
      .ToListAsync();

    return groups;
  }

  public async Task<CourseInformation?> GetCourse(int courseId)
  {
    var course = await _context.Courses
      .Include(c => c.Discipline)
      .FirstOrDefaultAsync(c => c.Id == courseId);

    var groups = await GetEnrolledGroups(courseId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Course", course)
    });

    if (!checkResult.Succeeded)
    {
      return null;
    }

    var courseInformation = new CourseInformation
    {
      Id = course!.Id,
      Code = course.Code,
      Name = course.Name,
      Description = course.Description,
      Discipline = course.Discipline.Name,
      EnrolledGroups = groups
    };

    return courseInformation;
  }

  public async Task<List<CourseInformation>> GetTeacherCourses(int teacherId)
  {
    var courses = await _context.CourseTeachers
      .Where(ct => ct.TeacherId == teacherId)
      .ToListAsync();

    var coursesList = new List<CourseInformation>();

    foreach (var course in courses)
    {
      var courseInformation = await GetCourse(course.CourseId);
      if (courseInformation is not null)
      {
        coursesList.Add(courseInformation);
      }
    }

    return coursesList;
  }

  public async Task<List<LessonData>> GetCourseLessons(int courseId)
  {
    var lessons = await _context.CourseLessons
      .Where(l => l.CourseId == courseId)
      .Select(l => new LessonData
      {
        Id = l.Id,
        Name = l.Name,
        CourseId = l.CourseId
      })
      .ToListAsync();

    return lessons;
  }


}