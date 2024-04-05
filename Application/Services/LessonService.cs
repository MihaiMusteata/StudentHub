using System.Text.Json;
using Application.Contract;
using Application.Helpers;
using Application.Interfaces;
using Application.Resources;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class LessonService : ILessonService
{
  private readonly StudentHubContext _context;
  private readonly ILogger<LessonService> _logger;
  private readonly IConfiguration _configuration;
  private readonly IWebHostEnvironment _env;

  public LessonService(StudentHubContext context, ILogger<LessonService> logger, IConfiguration configuration, IWebHostEnvironment env)
  {
    _context = context;
    _logger = logger;
    _configuration = configuration;
    _env = env;
  }

  public async Task<IdentityResult> CreateLesson(LessonData lessonData)
  {
    var errorDict = new Dictionary<string, string>();

    var lessonExists =
      await _context.CourseLessons.AnyAsync(l => l.Name == lessonData.Name && l.CourseId == lessonData.CourseId);
    if (lessonExists)
    {
      errorDict["name"] = string.Format(ErrorTemplate.ItemExists, "Lesson with this name");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "LessonExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var course = await _context.Courses.FindAsync(lessonData.CourseId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Course", course)
    });

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var newLesson = new CourseLessonDbTable()
    {
      Id = lessonData.Id,
      Name = lessonData.Name,
      CourseId = lessonData.CourseId,
    };

    try
    {
      await _context.CourseLessons.AddAsync(newLesson);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "creating a new lesson");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> DeleteLesson(int id)
  {
    var errorDict = new Dictionary<string, string>();

    var lesson = await _context.CourseLessons.FindAsync(id);
    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Lesson", lesson)
    });

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    try
    {
      _context.CourseLessons.Remove(lesson!);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "deleting a lesson");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> UpdateLesson(LessonData lessonData)
  {
    var errorDict = new Dictionary<string, string>();

    var oldLesson = await _context.CourseLessons.FindAsync(lessonData.Id);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Lesson", oldLesson)
    });
    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var lesson = await _context.CourseLessons.AnyAsync(l
      => l.Name == lessonData.Name && l.CourseId == lessonData.CourseId && l.Id != lessonData.Id);
    if (lesson)
    {
      errorDict["name"] = string.Format(ErrorTemplate.ItemExists, "Lesson with this name");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "LessonExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    oldLesson!.Name = lessonData.Name;

    try
    {
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException ex)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "updating lesson");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<LessonData?> GetLesson(int id)
  {
    var lesson = await _context.CourseLessons.FindAsync(id);
    if (lesson == null)
    {
      return null;
    }

    return new LessonData
    {
      Id = lesson.Id,
      Name = lesson.Name,
      CourseId = lesson.CourseId,
    };
  }

  public async Task<List<DocumentMinimal>> GetLessonDocuments(int lessonId)
  {
    var documents = await _context.LessonResources
      .Include(lr => lr.Document)
      .Where(lr => lr.CourseLessonId == lessonId)
      .Select(doc => new DocumentMinimal
      {
        Id = doc.Document.Id,
        Name = doc.Document.Name,
        Extension = doc.Document.Extension
      })
      .ToListAsync();

    return documents;
  }

  public async Task<IdentityResult> UploadDocumentToLesson(int lessonId, DocumentData documentData)
  {
    var errorDict = new Dictionary<string, string>();

    var lesson = await _context.CourseLessons.FindAsync(lessonId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Lesson", lesson)
    });

    _logger.LogInformation("Checking if lesson exists in the database");
    if (!checkResult.Succeeded)
    {
      _logger.LogError("Lesson not found in the database");
      return checkResult;
    }
    _logger.LogInformation("Lesson found in the database");

    var existingDocument = await _context.LessonResources
      .Where(lr => lr.Document.Name == documentData.Name && lr.Document.Extension == documentData.Extension &&
                   lr.CourseLessonId == lessonId)
      .Select(lr => new DocumentData
      {
        Id = lr.Document.Id,
        Name = lr.Document.Name,
        Extension = lr.Document.Extension
      })
      .FirstOrDefaultAsync();

    _logger.LogInformation("Checking if the document exists in the database.");
    if (existingDocument is not null)
    {
      _logger.LogInformation("Document found in the database.");
      documentData.FolderPath = Path.Combine(_env.ContentRootPath,
        _configuration["UploadsFolder"]!,
        existingDocument.Id.ToString());
      _logger.LogInformation("Checking if the folder exists.");
      if (Directory.Exists(documentData.FolderPath))
      {
        _logger.LogInformation("Folder exists.");
        _logger.LogError("Returning error : Upload failed. Document already exists.");
        errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Document");
        return IdentityResult.Failed(new IdentityError
        {
          Code = "DocumentExists",
          Description = JsonSerializer.Serialize(errorDict)
        });
      }
    }
    
    try
    {
      _logger.LogInformation("Trying to upload the document.");
      if (existingDocument is null)
      {
        _logger.LogInformation("Document does not exist in the database. Creating a new document.");
        var newDocument = new LessonResourceDbTable
        {
          CourseLessonId = lessonId,
          Document = new DocumentDbTable
          {
            Name = documentData.Name,
            Extension = documentData.Extension,
          }
        };
        await _context.LessonResources.AddAsync(newDocument);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Document created and saved to the database.");
        documentData.Id = newDocument.Document.Id;
        documentData.FolderPath = Path.Combine(_env.ContentRootPath,
          _configuration["UploadsFolder"]!,
          documentData.Id.ToString());
        _logger.LogInformation("Checking if the folder exists.");
        if (Directory.Exists(documentData.FolderPath))
        {
          _logger.LogInformation("Folder exists even though the resource wasn't in the database. Deleting the folder.");
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
      _logger.LogInformation("Error while uploading the document: {Error}", e.Message);
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "uploading a document to a lesson");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

}