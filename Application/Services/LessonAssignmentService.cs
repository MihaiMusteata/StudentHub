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

public class LessonAssignmentService : ILessonAssignmentService
{
  private readonly StudentHubContext _context;

  public LessonAssignmentService(StudentHubContext context)
  {
    _context = context;
  }

  public async Task<IdentityResult> CreateLessonAssignment(LessonAssignmentData lessonAssignmentData)
  {
    var errorDict = new Dictionary<string, string>();

    var lessonAssignmentExists = await _context.LessonAssignments.AnyAsync(la
      => la.Name == lessonAssignmentData.Name && la.CourseLessonId == lessonAssignmentData.LessonId);
    if (lessonAssignmentExists)
    {
      errorDict["name"] = string.Format(ErrorTemplate.ItemExists, "Lesson assignment with this name");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "LessonAssignmentExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var lesson = await _context.CourseLessons.FindAsync(lessonAssignmentData.LessonId);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Lesson", lesson)
    });

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var newLessonAssignment = new LessonAssignmentDbTable()
    {
      Id = lessonAssignmentData.Id,
      Name = lessonAssignmentData.Name,
      CourseLessonId = lessonAssignmentData.LessonId,
      Task = lessonAssignmentData.Task,
      AllowSubmission = lessonAssignmentData.AllowSubmission,
      DueDate = lessonAssignmentData.DueDate,
    };

    try
    {
      await _context.LessonAssignments.AddAsync(newLessonAssignment);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      return IdentityResult.Failed(new IdentityError
      {
        Code = "LessonAssignmentCreationFailed",
        Description = e.Message
      });
    }
  }

  public async Task<LessonAssignmentData?> GetLessonAssignment(int id)
  {
    var lessonAssignment = await _context.LessonAssignments.FindAsync(id);
    if (lessonAssignment == null)
    {
      return null;
    }
    return new LessonAssignmentData
    {
      Id = lessonAssignment.Id,
      LessonId = lessonAssignment.CourseLessonId,
      Name = lessonAssignment.Name,
      Task = lessonAssignment.Task,
      AllowSubmission = lessonAssignment.AllowSubmission,
      DueDate = lessonAssignment.DueDate,
    };
  }

  public async Task<List<LessonAssignmentMinimal>> GetLessonAssignments(int lessonId)
  {
    var lessonAssignments = await _context.LessonAssignments
      .Where(la => la.CourseLessonId == lessonId)
      .Select(assignment => new LessonAssignmentMinimal
      {
        Id = assignment.Id,
        Name = assignment.Name,
      })
      .ToListAsync();

    return lessonAssignments;
  }
  public async Task<IdentityResult> DeleteLessonAssignment(int id)
  {
    var errorDict = new Dictionary<string, string>();

    var lessonAssignment = await _context.LessonAssignments.FindAsync(id);
    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Lesson Assignment", lessonAssignment)
    });

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    try
    {
      _context.LessonAssignments.Remove(lessonAssignment!);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      return IdentityResult.Failed(new IdentityError
      {
        Code = "LessonAssignmentDeletionFailed",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }
  public async Task<IdentityResult> UpdateLessonAssignment(LessonAssignmentData lessonAssignmentData)
  {
    var errorDict = new Dictionary<string, string>();

    var oldLessonAssignment = await _context.LessonAssignments.FindAsync(lessonAssignmentData.Id);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Lesson Assignment", oldLessonAssignment)
    });

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var lessonAssignmentExists = await _context.LessonAssignments.AnyAsync(la
      => la.Name == lessonAssignmentData.Name && la.CourseLessonId == lessonAssignmentData.LessonId &&
         la.Id != lessonAssignmentData.Id);

    if (lessonAssignmentExists)
    {
      errorDict["name"] = string.Format(ErrorTemplate.ItemExists, "Lesson assignment with this name");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "LessonAssignmentExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    oldLessonAssignment!.Name = lessonAssignmentData.Name;
    oldLessonAssignment.Task = lessonAssignmentData.Task;
    oldLessonAssignment.AllowSubmission = lessonAssignmentData.AllowSubmission;
    oldLessonAssignment.DueDate = lessonAssignmentData.DueDate;

    try
    {
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      return IdentityResult.Failed(new IdentityError
      {
        Code = "LessonAssignmentUpdateFailed",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }
  public async Task<IdentityResult> UploadResource(int lessonAssignmentId, DocumentData documentData)
  {
    var errorDict = new Dictionary<string, string>();

    var lessonAssignment = await _context.LessonAssignments.FindAsync(lessonAssignmentId);

    var objectsToCheck = new List<(string, object?)>
    {
      ("Lesson Assignment", lessonAssignment)
    };

    var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var resourceExists = await _context.AssignmentResources
      .AnyAsync(ar => ar.Document.Name == documentData.Name && ar.Document.Extension == documentData.Extension &&
                      ar.LessonAssignmentId == lessonAssignmentId);

    if (resourceExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Resource");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "ResourceExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var newDocument = new DocumentDbTable()
    {
      Name = documentData.Name,
      Extension = documentData.Extension,
      Content = documentData.Content
    };

    var newResource = new AssignmentResourceDbTable()
    {
      LessonAssignmentId = lessonAssignmentId,
      Document = newDocument
    };

    try
    {
      await _context.AssignmentResources.AddAsync(newResource);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "uploading a new resource");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<List<DocumentData>> GetResources(int lessonAssignmentId)
  {
    var resources = await _context.AssignmentResources
      .Where(ar => ar.LessonAssignmentId == lessonAssignmentId)
      .Select(ar => new DocumentData
      {
        Id = ar.DocumentId,
        Name = ar.Document.Name,
        Extension = ar.Document.Extension,
      })
      .ToListAsync();
    return resources;
  }
}