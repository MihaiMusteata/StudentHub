using System.Text.Json;
using Application.Contract;
using Application.Interfaces;
using Application.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
// [Authorize(Roles = "Admin")]
public class TeachersController : ControllerBase
{
    private ITeachersService _teachersService;

    public TeachersController(ITeachersService teachersService)
    {
        _teachersService = teachersService;
    }

    [HttpGet("teachers")]
    public async Task<IActionResult> GetTeachers()
    {
        var result = await _teachersService.GetTeachers();
        if (result.Count == 0)
        {
            return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Teachers"));
        }

        return Ok(result);
    }

    [HttpGet("teacher/id/{id}")]
    public async Task<IActionResult> GetTeacherById(int id)
    {
        var result = await _teachersService.GetTeacherById(id);
        if (result is null)
        {
            var errorDict = new Dictionary<string, string>();
            errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Teacher");
            return NotFound(new List<string> { JsonSerializer.Serialize(errorDict) });
        }

        return Ok(result);
    }
    
    [HttpGet("teacher/user-id/{userId}")]
    public async Task<IActionResult> GetTeacherByUserId(string userId)
    {
        var result = await _teachersService.GetTeacherByUserId(userId);
        if (result is null)
        {
            var errorDict = new Dictionary<string, string>();
            errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "Teacher");
            return NotFound(new List<string> { JsonSerializer.Serialize(errorDict) });
        }

        return Ok(result);
    }

    [HttpPost("teacher")]
    public async Task<IActionResult> CreateTeacher(Teacher teacher)
    {
        var errors = new List<string>();
        var result = await _teachersService.CreateTeacher(teacher);
        if (result.Succeeded)
        {
            return Ok("Teacher Created");
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
    
    [HttpDelete("teacher")]
    public async Task<IActionResult> DeleteTeacher(int id)
    {
        var errors = new List<string>();
        var result = await _teachersService.DeleteTeacher(id);
        if (result.Succeeded)
        {
            return Ok("Teacher Deleted");
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
    
    [HttpPut("teacher")]
    public async Task<IActionResult> UpdateTeacher(Teacher teacher)
    {
        var errors = new List<string>();
        var result = await _teachersService.UpdateTeacher(teacher);
        if (result.Succeeded)
        {
            return Ok("Teacher Updated");
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