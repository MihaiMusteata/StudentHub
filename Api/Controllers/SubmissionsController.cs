using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SubmissionsController : ControllerBase
{
  private readonly ISubmissionService _submissionService;
  public SubmissionsController(ISubmissionService submissionService)
  {
    _submissionService = submissionService;
  }
  
  [HttpGet("group-submissions")]
  public async Task<IActionResult> GetGroupSubmissions(int courseId, int assignmentId, int groupId)
  {
    GroupSubmissionsData form = new GroupSubmissionsData
    {
      CourseId = courseId,
      AssignmentId = assignmentId,
      GroupId = groupId
    };
    var result = await _submissionService.GetStudentSubmissions(form);
    if (result is null)
    {
      var errorDict = new Dictionary<string, string>();
      errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Submissions");
      return NotFound(new List<string>
      {
        JsonSerializer.Serialize(errorDict)
      });
    }
    return Ok(result);
  }
}