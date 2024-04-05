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

public class LessonAssignmentService : ILessonAssignmentService
{
  private readonly StudentHubContext _context;
  private readonly ILogger<LessonAssignmentService> _logger;
  private readonly IWebHostEnvironment _env;
  private readonly IConfiguration _configuration;

  public LessonAssignmentService(StudentHubContext context, ILogger<LessonAssignmentService> logger, IConfiguration configuration, IWebHostEnvironment env)
  {
    _context = context;
    _logger = logger;
    _configuration = configuration;
    _env = env;
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

    _logger.LogInformation("Checking if lesson assignment exists in the database");
    if (!checkResult.Succeeded)
    {
      _logger.LogError("Lesson assignment not found in the database");
      return checkResult;
    }
    _logger.LogInformation("Lesson assignment found in the database");
    
    var existingResource = await _context.AssignmentResources
      .Where(ar => ar.Document.Name == documentData.Name && ar.Document.Extension == documentData.Extension &&
                   ar.LessonAssignmentId == lessonAssignmentId)
      .Select(ar => new DocumentData
        {
          Id = ar.Document.Id,
          Name = ar.Document.Name,
          Extension = ar.Document.Extension,
        })
      .FirstOrDefaultAsync();
    
    _logger.LogInformation("Checking if resource exists in the database");
    if (existingResource is not null)
    {
      _logger.LogInformation("Resource exists in the database");
      documentData.FolderPath = Path.Combine(_env.ContentRootPath, _configuration["UploadsFolder"]!, existingResource.Id.ToString());
      _logger.LogInformation("Checking if the folder exists");
      if (Directory.Exists(documentData.FolderPath))
      {
        _logger.LogInformation("Folder exists");
        _logger.LogInformation("Returning error : Upload failed. Resource already exists.");
        errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Resource");
        return IdentityResult.Failed(new IdentityError
        {
          Code = "ResourceExists",
          Description = JsonSerializer.Serialize(errorDict)
        });
      }
    }

    try
    {
      _logger.LogInformation("Trying to upload the resource.");
      if(existingResource is null)
      {
        _logger.LogInformation("Resource does not exist in the database. Creating a new resource.");
        var newResource = new AssignmentResourceDbTable
        {
          LessonAssignmentId = lessonAssignmentId,
          Document = new DocumentDbTable
          {
            Name = documentData.Name,
            Extension = documentData.Extension,
          }
        };
        await _context.AssignmentResources.AddAsync(newResource);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Resource created and saved to the database.");
        documentData.Id = newResource.Document.Id;
        documentData.FolderPath = Path.Combine(_env.ContentRootPath, _configuration["UploadsFolder"]!, documentData.Id.ToString());
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
      _logger.LogError("Error uploading the resource: {e}", e.Message);
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