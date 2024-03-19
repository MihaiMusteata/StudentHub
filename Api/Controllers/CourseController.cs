using Application.Contract;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CourseController : ControllerBase
{
  private readonly ICourseService _courseService;
  
  public CourseController(ICourseService courseService)
  {
    _courseService = courseService;
  }
  
  [HttpPost("course")]
  public async Task<IActionResult> CreateCourse(CourseData courseData)
  {
    var result = await _courseService.CreateCourse(courseData);
    if (result.Succeeded)
    {
      return Ok("Course Created");
    }
    
    var errors = new List<string>();
    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }
    
    return BadRequest(errors);
  }
  
  [HttpGet("teacher-courses")]
  public async Task<IActionResult> GetTeacherCourses(int id)
  {
    var courses = await _courseService.GetTeacherCourses(id);
    return Ok(courses);
  }
  
  [HttpPost("assign-teacher-to-course")]
  public async Task<IActionResult> AssignTeacherToCourse(int courseId, int teacherId)
  {
    var result = await _courseService.AssignTeacherToCourse(courseId, teacherId);
    if (result.Succeeded)
    {
      return Ok("Teacher Assigned");
    }
    
    var errors = new List<string>();
    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }
    
    return BadRequest(errors);
  }
  

}