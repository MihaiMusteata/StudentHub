using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class StudentsController : ControllerBase
{
    private readonly IStudentsService _studentsService;

    public StudentsController(IStudentsService studentsService)
    {
        _studentsService = studentsService;
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetStudents()
    {
        var result = await _studentsService.GetStudents();
        if (result.Count == 0)
        {
            return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Students"));
        }

        return Ok(result);
    }

    [HttpGet("student")]
    public async Task<IActionResult> GetStudent(int id)
    {
        var result = await _studentsService.GetStudent(id);
        if (result is null)
        {
            var errorDict = new Dictionary<string, string>();
            errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Student");
            return NotFound(new List<string> { JsonSerializer.Serialize(errorDict) });
        }

        return Ok(result);
    }

    [HttpPost("student")]
    public async Task<IActionResult> CreateStudent(Student student)
    {
        var errors = new List<string>();
        var result = await _studentsService.CreateStudent(student);
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

    [HttpDelete("student")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        var errors = new List<string>();
        var result = await _studentsService.DeleteStudent(id);
        if (result.Succeeded)
        {
            return Ok("Student Deleted");
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

    [HttpPut("student")]
    public async Task<IActionResult> UpdateStudent(Student student)
    {
        var errors = new List<string>();
        var result = await _studentsService.UpdateStudent(student);
        if (result.Succeeded)
        {
            return Ok("Student Updated");
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