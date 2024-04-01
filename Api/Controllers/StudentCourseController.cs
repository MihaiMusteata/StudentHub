using Application.Contract;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StudentCourseController : ControllerBase
{
  private readonly IStudentsService _studentsService;
  public StudentCourseController(IStudentsService studentsService)
  {
    _studentsService = studentsService;
  }
  
  [HttpPost("enroll")]
  public async Task<IActionResult> EnrollStudent(EnrollData enrollData)
  {
    var errors = new List<string>();
    var result = await _studentsService.EnrollStudent(enrollData);
    if (result.Succeeded)
    {
      return Ok("Student Created");
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
  
  [HttpDelete("unenroll")]
  public async Task<IActionResult> UnenrollStudent(int studentId, int courseId)
  {
    var errors = new List<string>();
    var result = await _studentsService.UnenrollStudent(studentId, courseId);
    if (result.Succeeded)
    {
      return Ok("Student Unenrolled");
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
  
  [HttpGet("student-courses")]
  public async Task<IActionResult> GetStudentCourses(int studentId)
  {
    var courses = await _studentsService.GetStudentCourses(studentId);
    return Ok(courses);
  }
}