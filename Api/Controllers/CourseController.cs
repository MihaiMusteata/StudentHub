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
  public async Task<IActionResult> CreateCourse(CourseForm courseData)
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
  
  [HttpPost("access-key")]
  public async Task<IActionResult> CreateAccessKey(AccessData accessData)
  {
    var result = await _courseService.CreateAccessKey(accessData);
    if (result.Succeeded)
    {
      return Ok("Access Key Created");
    }

    var errors = new List<string>();
    foreach (var error in result.Errors)
    {
      errors.Add(error.Description);
    }

    return BadRequest(errors);
  }
  
  [HttpGet("access-keys")]
  public async Task<IActionResult> GetCourseAccessKeys(int courseId)
  {
    var accessKeys = await _courseService.GetCourseAccessKeys(courseId);
    return Ok(accessKeys);
  }
  
  [HttpDelete("access-keys")]
  public async Task<IActionResult> DeleteAccessKey(AccessKeysData accessKeysIds)
  {
    var errors = new List<string>();
    var result = await _courseService.DeleteAccessKey(accessKeysIds);
    if (result.Succeeded)
    {
      return Ok("Access Key Deleted");
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