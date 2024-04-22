using Application.Contract;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GradesController: ControllerBase
{
  private readonly IGradesService _gradesService;
  public GradesController(IGradesService gradesService)
  {
    _gradesService = gradesService;
  }

  [HttpPost("grade-student")]
  public async Task<IActionResult> GradeStudent(GradeInfo grade)
  {
    var errors = new List<string>();
    var result = await _gradesService.GradeStudent(grade);
    if (result.Succeeded)
    {
      return Ok("Student graded successfully");
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