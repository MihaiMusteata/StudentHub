using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DocumentsController : ControllerBase
{
  private readonly IDocumentsService _documentsService;
  public DocumentsController(IDocumentsService documentsService)
  {
    _documentsService = documentsService;
  }

  [HttpPost("upload")]
  public async Task<IActionResult> UploadDocument(IFormFile file)
  {
    var errors = new List<string>();
    var documentData = new DocumentData();

    using (var ms = new MemoryStream())
    {
      await file.CopyToAsync(ms);
      documentData.Content = ms.ToArray();
      documentData.Extension = Path.GetExtension(file.FileName);
      documentData.Name = Path.GetFileNameWithoutExtension(file.FileName);
    }

    var result = await _documentsService.UploadDocument(documentData);
    if (result.Succeeded)
    {
      return Ok("Document uploaded successfully");
    }

    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }

    return BadRequest(errors);
  }

  [HttpGet("download")]
  public async Task<IActionResult> DownloadDocument(int id)
  {
    var result = await _documentsService.GetDocument(id);
    if (result is null)
    {
      var errorDict = new Dictionary<string, string>();
      errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Document");
      return NotFound(new List<string>
      {
        JsonSerializer.Serialize(errorDict)
      });
    }

    var fileBytes = result.Content;
    return File(fileBytes, "application/octet-stream", result.Name + result.Extension);
  }

  [HttpGet("documents")]
  public async Task<IActionResult> GetDocuments()
  {
    var result = await _documentsService.GetDocuments();
    if (result.Count == 0)
    {
      return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Documents"));
    }

    return Ok(result);
  }

  [HttpDelete("document")]
  public async Task<IActionResult> DeleteDocument(int id)
  {
    var errors = new List<string>();
    var result = await _documentsService.DeleteDocument(id);
    if (result.Succeeded)
    {
      return Ok("Document deleted successfully");
    }

    if (result.Errors.Any(e => e.Code == "404"))
    {
      return NotFound(result.Errors.First().Description);
    }

    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }

    return BadRequest(errors);
  }
  
}