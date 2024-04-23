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
      .AnyAsync(ct
        => ct.Course.Code == courseData.Code && ct.Course.Name == courseData.Name && ct.TeacherId == teacher!.Id);

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
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "creating a new course");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }
  public async Task<IdentityResult> CreateAccessKey(AccessData accessData)
  {
    var errorDict = new Dictionary<string, string>();

    var course = await _context.Courses.FindAsync(accessData.CourseId);
    var groups = await _context.Groups
      .Where(g => accessData.GroupsIds.Contains(g.Id))
      .ToListAsync();

    var checkCourseResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Course", course)
    });
    if (!checkCourseResult.Succeeded) return checkCourseResult;

    var checkGroupsResult = ErrorChecker.CheckNullObjects(groups.Select(g => ("One of the groups", (object?)g)));
    if (!checkGroupsResult.Succeeded) return checkGroupsResult;


    var accessKeyExists = await _context.CourseAccessKeys
      .AnyAsync(cak => cak.CourseId == accessData.CourseId && cak.AccessKey == accessData.AccessKey);

    if (accessKeyExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Access Key");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "AccessKeyExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    foreach (var group in groups)
    {
      var newAccessKey = new CourseAccessKeyDbTable()
      {
        CourseId = accessData.CourseId,
        GroupId = group.Id,
        AccessKey = accessData.AccessKey
      };
      await _context.CourseAccessKeys.AddAsync(newAccessKey);
    }

    try
    {
      await _context.SaveChangesAsync();
    }
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "creating a new access key");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }


    return IdentityResult.Success;


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
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "adding a teacher to a course");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> RemoveTeacherFromCourse(int courseId, int teacherId)
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

    var courseTeacher = await _context.CourseTeachers
      .FirstOrDefaultAsync(ct => ct.CourseId == courseId && ct.TeacherId == teacherId);
    if (courseTeacher is null)
    {
      errorDict["general"] = "Teacher is not assigned to this course";
      return IdentityResult.Failed(new IdentityError
      {
        Code = "TeacherNotAssigned",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    try
    {
      _context.CourseTeachers.Remove(courseTeacher);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "removing the teacher from the course");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<List<GroupData>> GetEnrolledGroups(int courseId)
  {
    var groups = await _context.CourseAccessKeys
      .Where(cak => cak.CourseId == courseId)
      .Select(cak => new GroupData
      {
        Id = cak.Group.Id,
        Name = cak.Group.Name
      })
      .Distinct()
      .ToListAsync();
    
    return groups;
  }
  
  public async Task<List<StudentMinimal>> GetEnrolledStudents(int courseId, int groupId)
  {
    var students = await _context.Students
      .Where(s => s.GroupId == groupId)
      .Select(s => s.Id)
      .ToListAsync();
    
    var enrolledStudents = await _context.EnrolledStudents
      .Where(es => es.CourseId == courseId && students.Any(s => s == es.StudentId))
      .Select(es => new StudentMinimal
      {
        Id = es.Student.Id,
        FirstName = es.Student.User.FirstName,
        LastName = es.Student.User.LastName
      })
      .ToListAsync();
    return enrolledStudents;
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
      EnrolledGroups = groups.Select(g => g.Name).ToList()
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
  
  public async Task<List<Teacher>> GetCourseTeachers(int courseId)
  {
    var teachers = await _context.CourseTeachers
      .Where(ct => ct.CourseId == courseId)
      .Select(ct => new Teacher
      {
        Id = ct.Teacher.Id,
        FirstName = ct.Teacher.User.FirstName,
        LastName = ct.Teacher.User.LastName,
        UserId = ct.Teacher.UserId,
        UniversityId = ct.Teacher.UniversityId
      })
      .ToListAsync();

    return teachers;
  }

  public async Task<List<Teacher>> GetAvailableTeachers(int courseId)
  {
    var teachers = await _context.Teachers
      .Where(t => !_context.CourseTeachers.Any(ct => ct.TeacherId == t.Id && ct.CourseId == courseId))
      .Select(t => new Teacher
      {
        Id = t.Id,
        FirstName = t.User.FirstName,
        LastName = t.User.LastName,
        UserId = t.UserId,
        UniversityId = t.UniversityId
      })
      .ToListAsync();

    return teachers;
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

  public async Task<List<AccessKeyData>> GetCourseAccessKeys(int courseId)
  {
    var accessKeys = await _context.CourseAccessKeys
      .Where(cak => cak.CourseId == courseId)
      .Select(cak => new AccessKeyData
      {
        Id = cak.Id,
        GroupName = cak.Group.Name,
        AccessKey = cak.AccessKey
      })
      .ToListAsync();

    return accessKeys;
  }

  public async Task<IdentityResult> DeleteAccessKey(AccessKeysData accessKeysIds)
  {
    var errorDict = new Dictionary<string, string>();
    var accessKeys = await _context.CourseAccessKeys
      .Where(cak => accessKeysIds.AccessKeys.Contains(cak.Id))
      .ToListAsync();

    var checkResult = ErrorChecker.CheckNullObjects(accessKeys.Select(ak => ("One of the access keys", (object?)ak)));
    if (!checkResult.Succeeded) return checkResult;

    try
    {
      _context.CourseAccessKeys.RemoveRange(accessKeys);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "deleting access keys");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }
  public async Task<List<CourseInformation>> SearchCourses(string search)
  {
    var courses = await _context.Courses
      .Where(c => (c.Name.ToLower() + " " + c.Code.ToLower()).Contains(search.ToLower()))
      .Select(c => new CourseInformation
      {
        Id = c.Id,
        Discipline = c.Discipline.Name,
        Name = c.Name,
        Description = c.Description,
        Code = c.Code
      })
      .ToListAsync();
    
    foreach (var course in courses)
    {
      var teachers = await _context.CourseTeachers
        .Where(ct => ct.CourseId == course.Id)
        .Select(ct => ct.Teacher.User.FirstName + " " + ct.Teacher.User.LastName)
        .ToListAsync();
      course.Teachers = teachers;
    }
    return courses;
  }

  public async Task<int> GetTotalAssignments(int courseId)
  {
    var totalAssignments = await _context.CourseLessons
      .Where(cl => cl.CourseId == courseId)
      .Join(
        _context.LessonAssignments,
        lesson => lesson.Id,
        assignment => assignment.CourseLessonId,
        (lesson, assignment) => assignment
      )
      .CountAsync();

    return totalAssignments;
  }

}