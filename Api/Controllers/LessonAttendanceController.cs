using Application.Contract;
using Application.Interfaces;
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
    var result = await _lessonAttendanceService.RecordLessonAttendance(form);
    return Ok(result);
  }

}