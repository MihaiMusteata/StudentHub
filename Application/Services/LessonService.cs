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

public class LessonService : ILessonService
{
  private readonly StudentHubContext _context;

  public LessonService(StudentHubContext context)
  {
    _context = context;
  }

  public async Task<IdentityResult> CreateLesson(LessonData lessonData)
  {
    var errorDict = new Dictionary<string, string>();

    var lessonExists = await _context.CourseLessons.AnyAsync(l => l.Name == lessonData.Name && l.CourseId == lessonData.CourseId);
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
    
    var lesson = await _context.CourseLessons.AnyAsync(l => l.Name == lessonData.Name && l.CourseId == lessonData.CourseId);
    if (lesson )
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

    var documentExists = await _context.LessonResources
      .Include(lr => lr.Document)
      .AnyAsync(lr => lr.Document.Name == documentData.Name && lr.Document.Extension == documentData.Extension &&
                      lr.CourseLessonId == lessonId);
    if (documentExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Document");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DocumentExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var lesson = await _context.CourseLessons.FindAsync(lessonId);
    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Lesson", lesson)
    });

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var document = new DocumentDbTable
    {
      Name = documentData.Name,
      Content = documentData.Content,
      Extension = documentData.Extension
    };

    var lessonResource = new LessonResourceDbTable
    {
      CourseLessonId = lessonId,
      Document = document
    };

    try
    {
      await _context.LessonResources.AddAsync(lessonResource);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "uploading a document to a lesson");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> DeleteDocumentFromLesson(int lessonId, int documentId)
  {
    var errorDict = new Dictionary<string, string>();

    var lessonResource = await _context.LessonResources
      .Include(lr => lr.Document)
      .FirstOrDefaultAsync(lr => lr.CourseLessonId == lessonId && lr.DocumentId == documentId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Lesson Resource", lessonResource)
    });

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    try
    {
      _context.LessonResources.Remove(lessonResource!);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "deleting a document from a lesson");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

}