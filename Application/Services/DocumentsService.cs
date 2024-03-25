using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class DocumentsService : IDocumentsService
{
  private readonly StudentHubContext _context;

  public DocumentsService(StudentHubContext context)
  {
    _context = context;
  }

  public async Task<IdentityResult> CreateDocument(DocumentData documentData)
  {
    var errorDict = new Dictionary<string, string>();

    var documentExists = await _context.Documents.AnyAsync(d => d.Name == documentData.Name && d.Extension == documentData.Extension);
    if (documentExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Document");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DocumentExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var newDocument = new DocumentDbTable()
    {
      Id = documentData.Id,
      Name = documentData.Name,
      Extension = documentData.Extension,
      Content = documentData.Content
    };
    try
    {
      await _context.Documents.AddAsync(newDocument);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (Exception e)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "creating a new document");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<DocumentData?> GetDocument(int id)
  {
    var document = await _context.Documents.FindAsync(id);
    if (document == null)
    {
      return null;
    }

    return new DocumentData
    {
      Id = document.Id,
      Name = document.Name,
      Extension = document.Extension,
      Content = document.Content
    };
  }

  public async Task<List<DocumentMinimal>> GetDocuments()
  {
    var documents = await _context.Documents
      .Select(doc => new DocumentMinimal { Id = doc.Id, Name = doc.Name, Extension = doc.Extension})
      .ToListAsync();

    return documents;
  }

}