using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using Application.Contract;
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

public class DocumentsService : IDocumentsService
{
  private readonly StudentHubContext _context;
  private readonly IWebHostEnvironment _env;
  private readonly IConfiguration _configuration;
  private readonly ILogger<DocumentsService> _logger;

  public DocumentsService(
    StudentHubContext context,
    IWebHostEnvironment env,
    IConfiguration configuration,
    ILogger<DocumentsService> logger)
  {
    _context = context;
    _env = env;
    _configuration = configuration;
    _logger = logger;
  }

  public async Task<IdentityResult> UploadDocument(DocumentData documentData)
  {
    _logger.LogInformation("Uploading a new document.");
    var errorDict = new Dictionary<string, string>();

    var existingDocument = await _context.Documents
      .Where(d => d.Name == documentData.Name && d.Extension == documentData.Extension)
      .Select(d => new DocumentData
      {
        Id = d.Id,
        Name = d.Name,
        Extension = d.Extension,
      })
      .FirstOrDefaultAsync();

    _logger.LogInformation("Checking if the document exists in the database.");
    if (existingDocument is not null)
    {
      _logger.LogInformation("Document found in the database.");
      documentData.FolderPath = Path.Combine(_env.ContentRootPath, _configuration["UploadsFolder"]!, existingDocument.Id.ToString());
      _logger.LogInformation("Checking if the folder exists.");
      if (Directory.Exists(documentData.FolderPath))
      {
        _logger.LogInformation("Folder exists.");
        _logger.LogInformation("Returning error : Upload failed. Document already exists.");
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
        var newDocument = new DocumentDbTable
        {
          Name = documentData.Name,
          Extension = documentData.Extension,
        };

        await _context.Documents.AddAsync(newDocument);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Document created and saved to the database.");
        documentData.Id = newDocument.Id;
        documentData.FolderPath = Path.Combine(_env.ContentRootPath, _configuration["UploadsFolder"]!, documentData.Id.ToString());
        if (Directory.Exists(documentData.FolderPath))
        {
          _logger.LogInformation("Folder exists even though the document wasn't in the database. Deleting the folder.");
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
      _logger.LogError("Error uploading the document. {e}", e.Message);
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "uploading a new document");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<DocumentData?> GetDocument(int id)
  {
    var documentData = await _context.Documents
      .Where(d => d.Id == id)
      .Select(d => new DocumentData
      {
        Id = d.Id,
        Name = d.Name,
        Extension = d.Extension,
        FolderPath = Path.Combine(_env.ContentRootPath, _configuration["UploadsFolder"]!, d.Id.ToString())
      })
      .FirstOrDefaultAsync();

    if (documentData is null || !Directory.Exists(documentData.FolderPath))
    {
      return null;
    }

    using FileStream stream = new FileStream(Path.Combine(documentData.FolderPath, documentData.Name + documentData.Extension), FileMode.Open);

    documentData.Content = new byte[stream.Length];
    var result = stream.Read(documentData.Content, 0, documentData.Content.Length);
    return documentData;
  }

  public async Task<List<DocumentMinimal>> GetDocuments()
  {
    var documents = await _context.Documents
      .Select(doc => new DocumentMinimal
      {
        Id = doc.Id,
        Name = doc.Name,
        Extension = doc.Extension
      })
      .ToListAsync();

    return documents;
  }

  public async Task<IdentityResult> DeleteDocument(int id)
  {
    var errorDict = new Dictionary<string, string>();
    var documentExists = await _context.Documents.AnyAsync(d => d.Id == id);
    if (!documentExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Document");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "404",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var document = await _context.Documents
      .Where(d => d.Id == id)
      .Select(d => new DocumentData
        {
          Id = d.Id,
          Name = d.Name,
          Extension = d.Extension,
          FolderPath = Path.Combine(_env.ContentRootPath, _configuration["UploadsFolder"]!, d.Id.ToString())
        })
      .FirstOrDefaultAsync();
      
    try
    {
      if (Directory.Exists(document!.FolderPath))
      {
        Directory.Delete(document.FolderPath, true);
      }
      _context.Documents.Remove(new DocumentDbTable { Id = id });
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      _logger.LogError("Error deleting the document. {e}", e.Message);
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "deleting a document");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

}