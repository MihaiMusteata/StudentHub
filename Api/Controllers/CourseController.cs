using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
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

  [HttpGet("enrolled-groups")]
  public async Task<IActionResult> GetEnrolledGroups(int courseId)
  {
    var groups = await _courseService.GetEnrolledGroups(courseId);
    return Ok(groups);
  }

  [HttpGet("teacher-courses")]
  public async Task<IActionResult> GetTeacherCourses(int teacherId)
  {
    var courses = await _courseService.GetTeacherCourses(teacherId);
    if (courses.Count == 0)
    {
      var errorDict = new Dictionary<string, string>();
      errorDict["general"] = string.Format(ErrorTemplate.NoItemsFound, "Courses");
      return NotFound(new List<string>
      {
        JsonSerializer.Serialize(errorDict)
      });
    }
    return Ok(courses);
  }

  [HttpGet("course")]
  public async Task<IActionResult> GetCourse(int id)
  {
    var course = await _courseService.GetCourse(id);
    if (course is null)
    {
      var errorDict = new Dictionary<string, string>();
      errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Course");
      return NotFound(new List<string>
      {
        JsonSerializer.Serialize(errorDict)
      });
    }

    return Ok(course);
  }
  
  [HttpGet("course-lessons")]
  public async Task<IActionResult> GetCourseLessons(int courseId)
  {
    var lessons = await _courseService.GetCourseLessons(courseId);
    return Ok(lessons);
  }




}