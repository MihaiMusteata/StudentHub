using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LessonController : ControllerBase
{
  private readonly ILessonService _lessonService;

  public LessonController(ILessonService lessonService)
  {
    _lessonService = lessonService;
  }

  [HttpPost("lesson")]
  public async Task<IActionResult> CreateLesson(LessonData lessonData)
  {
    var result = await _lessonService.CreateLesson(lessonData);
    if (result.Succeeded)
    {
      return Ok("Lesson Created");
    }

    var errors = new List<string>();
    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }

    return BadRequest(errors);
  }

  [HttpGet("lesson")]
  public async Task<IActionResult> GetLesson(int id)
  {
    var lesson = await _lessonService.GetLesson(id);
    if (lesson is null)
    {
      var errorDict = new Dictionary<string, string>();
      errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Lesson");
      return NotFound(new List<string>
      {
        JsonSerializer.Serialize(errorDict)
      });
    }

    return Ok(lesson);
  }

  [HttpGet("lesson-documents")]
  public async Task<IActionResult> GetLessonDocuments(int lessonId)
  {
    var documents = await _lessonService.GetLessonDocuments(lessonId);
    return Ok(documents);
  }

  [HttpPost("upload-document/{lessonId}")]
  public async Task<IActionResult> UploadDocumentToLesson(int lessonId, IFormFile file)
  {
    var documentData = new DocumentData();
    using (var ms = new MemoryStream())
    {
      file.CopyTo(ms);
      var fileBytes = ms.ToArray();
      documentData.Content = Convert.ToBase64String(fileBytes);
      documentData.Extension = Path.GetExtension(file.FileName);
      documentData.Name = Path.GetFileNameWithoutExtension(file.FileName);
    }
    
    var result = await _lessonService.UploadDocumentToLesson(lessonId, documentData);
    if (result.Succeeded)
    {
      return Ok("Document uploaded successfully");
    }

    var errors = new List<string>();
    if (result.Errors.Any(e => e.Code == "404"))
    {
      errors.Add(result.Errors.First().Description);
      return NotFound(errors);
    }

    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }

    return BadRequest(errors);
  }
  
  [HttpDelete("document")]
  public async Task<IActionResult> DeleteDocumentFromLesson(int lessonId, int documentId)
  {
    var result = await _lessonService.DeleteDocumentFromLesson(lessonId, documentId);
    if (result.Succeeded)
    {
      return Ok("Document deleted successfully");
    }

    var errors = new List<string>();
    if (result.Errors.Any(e => e.Code == "404"))
    {
      errors.Add(result.Errors.First().Description);
      return NotFound(errors);
    }

    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }

    return BadRequest(errors);
  }


}