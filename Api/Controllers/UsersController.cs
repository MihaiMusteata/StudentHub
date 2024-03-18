using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Text.Json;
using Api.Models;
using Application.Contract;
using Application.Resources;
using Domain.User;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly IUsersService _usersService;

    public UsersController(IRoleService roleService, IUsersService usersService)
    {
        _usersService = usersService;
        _roleService = roleService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var result = await _usersService.GetUsers();
        var profiles = result.Select(user => new Profile
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Email = user.Email,
                BirthDate = user.BirthDate,
                Role = _roleService.GetUserRole(user.Id)
            })
            .ToList();

        return Ok(profiles);
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUser(string id)
    {
        var result = await _usersService.GetUser(id);
        if (result is null)
        {
            var errorDict = new Dictionary<string, string>();
            errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, "User");
            return NotFound(new List<string> { JsonSerializer.Serialize(errorDict) });
        }

        return Ok(result);
    }

    [HttpPost("user")]
    public async Task<IActionResult> CreateUser(NewUserData user)
    {
        var result = await _usersService.CreateUser(user);
        var errors = new List<string>();
        if (result.Succeeded)
        {
            return Ok("User Created");
        }

        foreach (var error in result.Errors)
        {
            errors.Add(error.Description);
        }

        return BadRequest(errors);
    }

    [HttpDelete("user")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var errors = new List<string>();
        var result = await _usersService.DeleteUser(id);
        if (result.Succeeded)
        {
            return Ok("User Deleted");
        }

        foreach (var error in result.Errors)
        {
            errors.Add(error.Description);
        }

        return BadRequest(errors);
    }

    [HttpPut("user")]
    public async Task<IActionResult> UpdateUser(Profile profile)
    {
        User user = new User
        {
            Id = profile.Id,
            UserName = profile.UserName,
            Email = profile.Email,
            BirthDate = profile.BirthDate,
            FirstName = profile.FirstName,
            LastName = profile.LastName
        };

        var errors = new List<string>();

        var userResult = await _usersService.UpdateUser(user);

        if (userResult.Succeeded)
        {
            var roleResult = await _roleService.UpdateUserRole(profile.Id, profile.Role);
            if (roleResult.Succeeded)
            {
                return Ok("User Updated");
            }

            foreach (var error in roleResult.Errors)
            {
                errors.Add(error.Description);
            }

            return BadRequest(errors);
        }

        foreach (var error in userResult.Errors)
        {
            errors.Add(error.Description);
        }

        return BadRequest(errors);
    }
}