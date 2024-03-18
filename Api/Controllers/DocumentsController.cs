using Application.Contract;
using Application.Interfaces;
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
      file.CopyTo(ms);
      var fileBytes = ms.ToArray();
      documentData.Content = Convert.ToBase64String(fileBytes);
      documentData.Extension = Path.GetExtension(file.FileName);
      documentData.Name = Path.GetFileNameWithoutExtension(file.FileName);
    }
    
    var result = await _documentsService.CreateDocument(documentData);
    if (result.Succeeded)
    {
      return Ok();
    }

    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }

    return BadRequest(errors);
  }

}