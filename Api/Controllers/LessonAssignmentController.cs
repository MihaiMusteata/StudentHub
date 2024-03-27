using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LessonAssignmentController : ControllerBase
{
  private readonly ILessonAssignmentService _lessonAssignmentService;
  public LessonAssignmentController(ILessonAssignmentService lessonAssignmentService)
  {
    _lessonAssignmentService = lessonAssignmentService;
  }
  
  [HttpPost("assignment")]
  public async Task<IActionResult> CreateLessonAssignment(LessonAssignmentData lessonAssignmentData)
  {
    var result = await _lessonAssignmentService.CreateLessonAssignment(lessonAssignmentData);
    if (result.Succeeded)
    {
      return Ok("Lesson Assignment Created");
    }

    var errors = new List<string>();
    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }

    return BadRequest(errors);
  }
  
  [HttpGet("assignments/{lessonId}")]
  public async Task<IActionResult> GetLessonAssignments(int lessonId)
  {
    var assignments = await _lessonAssignmentService.GetLessonAssignments(lessonId);
    return Ok(assignments);
  }

  [HttpGet("assignment")]
  public async Task<IActionResult> GetLessonAssignment(int id)
  {
    var lesson = await _lessonAssignmentService.GetLessonAssignment(id);
    if (lesson is null)
    {
      var errorDict = new Dictionary<string, string>();
      errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Assignment");
      return NotFound(new List<string>
      {
        JsonSerializer.Serialize(errorDict)
      });
    }

    return Ok(lesson);
  }

  [HttpDelete("assignment")]
  public async Task<IActionResult> DeleteLessonAssignment(int id)
  {
    var errors = new List<string>();
    var result = await _lessonAssignmentService.DeleteLessonAssignment(id);
    if (result.Succeeded)
    {
      return Ok("Lesson Assignment deleted successfully");
    }

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
  
  [HttpPut("assignment")]
  public async Task<IActionResult> UpdateLessonAssignment(LessonAssignmentData lessonAssignmentData)
  {
    var errors = new List<string>();
    var result = await _lessonAssignmentService.UpdateLessonAssignment(lessonAssignmentData);

    if (result.Succeeded)
    {
      return Ok("Lesson Assignment updated successfully");
    }

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