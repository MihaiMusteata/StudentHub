using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class DocumentsService: IDocumentsService
{
  private readonly StudentHubContext _context;
  
  public DocumentsService(StudentHubContext context)
  {
    _context = context;
  }

  public async Task<IdentityResult> CreateDocument(DocumentData documentData)
  {
    var errorDict = new Dictionary<string, string>();
    
    var documentExists = await _context.Documents.AnyAsync(d => d.Name == documentData.Name);
    if (documentExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists,"Document with this name");
      return IdentityResult.Failed(new IdentityError { Code = "404", Description = "Document with this name already exists" });
    }
    
    var newDocument = new DocumentDbTable() 
    {
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

}