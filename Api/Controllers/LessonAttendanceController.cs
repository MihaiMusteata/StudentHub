using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LessonAttendanceController: ControllerBase
{
  private readonly ILessonAttendanceService _lessonAttendanceService;
  public LessonAttendanceController(ILessonAttendanceService lessonAttendanceService)
  {
    _lessonAttendanceService = lessonAttendanceService;
  }
  
  [HttpPost("record-attendance")]
  public async Task<IActionResult> RecordAttendance(AttendanceData form)
  {
    var errors = new List<string>();
    var result = await _lessonAttendanceService.RecordLessonAttendance(form);
    
    if (result.Succeeded)
    {
      return Ok("Attendance recorded successfully");
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
  
  [HttpGet("get-attendance")]
  public async Task<IActionResult> GetAttendance(int courseId, int lessonId, DateTime date, int groupId)
  {
    GroupAttendanceData form = new GroupAttendanceData
    {
      CourseId = courseId,
      CourseLessonId = lessonId,
      Date = date,
      GroupId = groupId
    };
    var result = await _lessonAttendanceService.GetLessonAttendance(form);
    if (result is null)
    {
      var errorDict = new Dictionary<string, string>();
      errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Attendance");
      return NotFound(new List<string>
      {
        JsonSerializer.Serialize(errorDict)
      });
    }
    return Ok(result);
  }

}