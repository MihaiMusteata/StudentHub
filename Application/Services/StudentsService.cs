using System.Text.Json;
using Application.Contract;
using Application.Helpers;
using Application.Identity;
using Application.Interfaces;
using Application.Resources;
using AutoMapper;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class StudentsService : IStudentsService
{
  private readonly IdentityUserManager _userManager;
  private readonly StudentHubContext _context;
  private readonly IMapper _mapper;
  private readonly ILogger<StudentsService> _logger;
  private readonly IConfiguration _configuration;
  private readonly IWebHostEnvironment _env;

  public StudentsService(
    IdentityUserManager userManager,
    StudentHubContext context,
    IMapper mapper,
    ILogger<StudentsService> logger,
    IConfiguration configuration,
    IWebHostEnvironment env)
  {
    _userManager = userManager;
    _context = context;
    _mapper = mapper;
    _logger = logger;
    _configuration = configuration;
    _env = env;
  }

  public async Task<List<Student>> GetStudents()
  {
    var students = await _context.Students
      .Include(s => s.Faculty)
      .Include(s => s.Specialty)
      .Include(s => s.Department)
      .Include(s => s.University)
      .Include(s => s.User)
      .ToListAsync();
    var studentList = _mapper.Map<List<Student>>(students);
    return studentList;
  }

  public async Task<Student?> GetStudentById(int id)
  {
    var student = await _context.Students
      .Include(s => s.Faculty)
      .Include(s => s.Specialty)
      .Include(s => s.Department)
      .Include(s => s.University)
      .Include(s => s.Group)
      .Include(s => s.User)
      .FirstOrDefaultAsync(s => s.Id == id);
    var result = _mapper.Map<Student>(student);
    return result;
  }

  public async Task<Student?> GetStudentByUserId(string userId)
  {
    var student = await _context.Students
      .Include(s => s.Faculty)
      .Include(s => s.Specialty)
      .Include(s => s.Department)
      .Include(s => s.University)
      .Include(s => s.Group)
      .Include(s => s.User)
      .FirstOrDefaultAsync(s => s.UserId == userId);
    var result = _mapper.Map<Student>(student);
    return result;
  }

  public async Task<IdentityResult> CreateStudent(Student student)
  {
    var errorDict = new Dictionary<string, string>();

    var studentExists = await _context.Students.AnyAsync(s => s.UserId == student.UserId);
    if (studentExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Student");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "StudentExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var user = _userManager.FindByIdAsync(student.UserId).Result;
    var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == student.DepartmentId);
    var faculty = await _context.Faculties.FirstOrDefaultAsync(f => f.Id == student.FacultyId);
    var specialty = await _context.Specialties.FirstOrDefaultAsync(s => s.Id == student.SpecialtyId);
    var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == student.UniversityId);

    var objectsToCheck = new List<(string, object?)>
    {
      ("User", user),
      ("University", university),
      ("Department", department),
      ("Faculty", faculty),
      ("Specialty", specialty)
    };

    var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var objectsToCheck2 = new List<(object, object, string, string)>
    {
      (department!.FacultyId, student.FacultyId, "Department", "Faculty"),
      (faculty!.UniversityId, student.UniversityId, "Faculty", "University"),
      (specialty!.FacultyId, student.FacultyId, "Specialty", "Faculty")
    };

    var checkResult2 = ErrorChecker.CheckMismatch(objectsToCheck2);

    if (!checkResult2.Succeeded)
    {
      return checkResult2;
    }

    var newStudent = new StudentDbTable();

    _mapper.Map(student, newStudent);

    try
    {
      await _context.Students.AddAsync(newStudent);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "creating student");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> DeleteStudent(int id)
  {
    var errorDict = new Dictionary<string, string>();

    var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == id);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Student", student)
    });
    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    _context.Students.Remove(student!);
    try
    {
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "deleting student");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> UpdateStudent(Student student)
  {
    var errorDict = new Dictionary<string, string>();

    var oldStudent = await _context.Students.FirstOrDefaultAsync(s => s.Id == student.Id);
    var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == student.DepartmentId);
    var faculty = await _context.Faculties.FirstOrDefaultAsync(f => f.Id == student.FacultyId);
    var specialty = await _context.Specialties.FirstOrDefaultAsync(s => s.Id == student.SpecialtyId);
    var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == student.UniversityId);

    var oldUser = await _userManager.FindByIdAsync(student.UserId);

    var objectsToCheck = new List<(string, object?)>
    {
      ("Student", oldStudent),
      ("User", oldUser),
      ("University", university),
      ("Department", department),
      ("Faculty", faculty),
      ("Specialty", specialty)
    };

    var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var objectsToCheck2 = new List<(object, object, string, string)>
    {
      (department!.FacultyId, student.FacultyId, "Department", "Faculty"),
      (faculty!.UniversityId, student.UniversityId, "Faculty", "University"),
      (specialty!.FacultyId, student.FacultyId, "Specialty", "Faculty")
    };

    var checkResult2 = ErrorChecker.CheckMismatch(objectsToCheck2);

    if (!checkResult2.Succeeded)
    {
      return checkResult2;
    }

    oldUser!.FirstName = student.FirstName;
    oldUser.LastName = student.LastName;
    oldUser.BirthDate = student.BirthDate;
    var resultUser = await _userManager.UpdateAsync(oldUser);
    if (!resultUser.Succeeded)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "updating user");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    _mapper.Map(student, oldStudent);

    try
    {
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "updating student");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> EnrollStudent(EnrollData enrollData)
  {
    var errorDict = new Dictionary<string, string>();

    var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == enrollData.StudentId);
    var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == enrollData.CourseId);

    var objectsToCheck = new List<(string, object?)>
    {
      ("Student", student),
      ("Course", course)
    };

    var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var studentAlreadyEnrolled = await _context.EnrolledStudents.AnyAsync(es
      => es.StudentId == enrollData.StudentId && es.CourseId == enrollData.CourseId);
    if (studentAlreadyEnrolled)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Student already enrolled in course");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "StudentAlreadyEnrolled",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var courseAccessKeys = await _context.CourseAccessKeys
      .Where(cak => cak.CourseId == enrollData.CourseId && cak.GroupId == student!.GroupId)
      .Select(cak => cak.AccessKey)
      .ToListAsync();

    if (!courseAccessKeys.Contains(enrollData.AccessKey))
    {
      errorDict["accessKey"] = "Wrong access key for course";
      return IdentityResult.Failed(new IdentityError
      {
        Code = "WrongAccessKey",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var studentCourse = new EnrolledStudentsDbTable()
    {
      StudentId = enrollData.StudentId,
      CourseId = enrollData.CourseId
    };

    try
    {
      await _context.EnrolledStudents.AddAsync(studentCourse);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "enrolling student");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> UnenrollStudent(int studentId, int courseId)
  {
    var errorDict = new Dictionary<string, string>();

    var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == studentId);
    var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);

    var objectsToCheck = new List<(string, object?)>
    {
      ("Student", student),
      ("Course", course)
    };

    var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var enrolledStudent = await _context.EnrolledStudents.FirstOrDefaultAsync(es
      => es.StudentId == studentId && es.CourseId == courseId);

    if (enrolledStudent == null)
    {
      errorDict["general"] = "Student is not enrolled in course";
      return IdentityResult.Failed(new IdentityError
      {
        Code = "StudentNotEnrolled",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    _context.EnrolledStudents.Remove(enrolledStudent);

    try
    {
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "unenrolling student");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<List<CourseInformation>> GetStudentCourses(int studentId)
  {
    var studentCourses = await _context.EnrolledStudents
      .Include(es => es.Course)
      .Where(es => es.StudentId == studentId)
      .Select(es => new CourseInformation
      {
        Id = es.Course.Id,
        Discipline = es.Course.Discipline.Name,
        Name = es.Course.Name,
        Description = es.Course.Description,
        Code = es.Course.Code
      })
      .ToListAsync();
    foreach (var course in studentCourses)
    {
      var teachers = await _context.CourseTeachers
        .Where(ct => ct.CourseId == course.Id)
        .Select(ct => ct.Teacher.User.FirstName + " " + ct.Teacher.User.LastName)
        .ToListAsync();
      course.Teachers = teachers;
    }
    return studentCourses;
  }

  public async Task<IdentityResult> UploadSubmission(int studentId, int lessonAssignmentId, DocumentData documentData)
  {
    var errorDict = new Dictionary<string, string>();

    var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == studentId);
    var assignment = await _context.LessonAssignments.FirstOrDefaultAsync(la => la.Id == lessonAssignmentId);

    var objectsToCheck = new List<(string, object?)>
    {
      ("Student", student),
      ("Assignment", assignment)
    };

    var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

    _logger.LogInformation("Checking if student and assignment exist in the database");
    if (!checkResult.Succeeded)
    {
      _logger.LogError("Student or assignment does not found in the database");
      return checkResult;
    }
    _logger.LogInformation("Student and assignment found in the database");

    var existingDocument = await _context.Submissions
      .Where(lr => lr.Document.Name == documentData.Name && lr.Document.Extension == documentData.Extension &&
                   lr.StudentId == studentId && lr.LessonAssignmentId == lessonAssignmentId)
      .Select(lr => new DocumentData
      {
        Id = lr.Document.Id,
        Name = lr.Document.Name,
        Extension = lr.Document.Extension
      })
      .FirstOrDefaultAsync();

    _logger.LogInformation("Checking if the submission exists in the database");
    if (existingDocument is not null)
    {
      _logger.LogInformation("Submission found in the database");
      documentData.FolderPath = Path.Combine(_env.ContentRootPath,
        _configuration["UploadsFolder"]!,
        existingDocument.Id.ToString());
      _logger.LogInformation("Checking if the folder exists");
      if (Directory.Exists(documentData.FolderPath))
      {
        _logger.LogInformation("Folder exists");
        _logger.LogError("Returning error : Upload failed. Submission already exists");
        errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Submission");
        return IdentityResult.Failed(new IdentityError
        {
          Code = "SubmissionExists",
          Description = JsonSerializer.Serialize(errorDict)
        });
      }
    }

    try
    {
      _logger.LogInformation("Trying to upload the submission");
      if (existingDocument is null)
      {
        _logger.LogInformation("Submission does not exist in the database. Creating a new submission");
        var newSubmission = new SubmissionDbTable
        {
          StudentId = studentId,
          LessonAssignmentId = lessonAssignmentId,
          Document = new DocumentDbTable
          {
            Name = documentData.Name,
            Extension = documentData.Extension
          },
          SubmissionDate = DateTime.Now
        };
        await _context.Submissions.AddAsync(newSubmission);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Submission created and saved to the database");
        documentData.Id = newSubmission.Document.Id;
        documentData.FolderPath = Path.Combine(_env.ContentRootPath,
          _configuration["UploadsFolder"]!,
          documentData.Id.ToString());
        _logger.LogInformation("Checking if the folder exists");
        if(Directory.Exists(documentData.FolderPath))
        {
          _logger.LogInformation("Folder exists even though the submission wasn't in the database. Deleting the folder.");
          Directory.Delete(documentData.FolderPath, true);
        }
      }
      
      _logger.LogInformation("Writing the document to the file system.");
      Directory.CreateDirectory(documentData.FolderPath);
      _logger.LogInformation("Folder created: {FolderPath}", documentData.FolderPath);
      using FileStream stream = new FileStream(Path.Combine(documentData.FolderPath, documentData.Name + documentData.Extension), FileMode.Create);
      stream.Write(documentData.Content, 0, documentData.Content.Length);
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      _logger.LogInformation("Error while uploading the submission: {Error}", e.Message);
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "uploading submission");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<StudentSubmissions> GetSubmissions(int studentId, int lessonAssignmentId)
  {
    var submissions = await _context.Submissions
      .Where(s => s.StudentId == studentId && s.LessonAssignmentId == lessonAssignmentId)
      .Select(s => new SubmissionData
      {
        Id = s.Id,
        DocumentData = new DocumentMinimal
        {
          Id = s.Document.Id,
          Name = s.Document.Name,
          Extension = s.Document.Extension
        },
        SubmissionDate = s.SubmissionDate
      })
      .ToListAsync();
    
    var assignmentGrade = await _context.Grades
      .Where(g => g.StudentId == studentId && g.AssignmentId == lessonAssignmentId)
      .Select(g => new GradeMinimalInfo
      {
        Grade = g.Grade,
        TeacherName = g.TeacherName
      })
      .FirstOrDefaultAsync();
    
    var studentSubmissions = new StudentSubmissions
    {
      StudentId = studentId,
      Submissions = submissions,
      Grade = assignmentGrade
    };
    
    return studentSubmissions;
  }

  public async Task<List<StudentGrades>> GetStudentGrades(int studentId, int courseId)
  {
    var result = new List<StudentGrades>();
    var lessons = await _context.CourseLessons
      .Where(l => l.CourseId == courseId)
      .ToListAsync();

    foreach (var lesson in lessons)
    {
      var lessonAssignments = await _context.LessonAssignments
        .Where(la => la.CourseLessonId == lesson.Id)
        .ToListAsync();

      foreach (var assignment in lessonAssignments)
      {
        var studentGrades = await _context.Grades
          .Where(g => g.StudentId == studentId && g.AssignmentId == assignment.Id)
          .Select(g => new StudentGrades
          {
            Grade = g.Grade,
            GradeItem = g.Assignment.Name
          })
          .ToListAsync();

        result.AddRange(studentGrades);
      }
    }
    return result;
  }
}