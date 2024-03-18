using System.Text.Json;
using Application.Interfaces;
using Domain.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class RoleService : IRoleService
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<User> _userManager;

    public RoleService(RoleManager<IdentityRole> roleManager, UserManager<User> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task<IdentityResult> CreateRole(string roleName)
    {
        var role = new IdentityRole
        {
            Name = roleName
        };

        var result = await _roleManager.CreateAsync(role);
        return result;
    }

    public string GetUserRole(string userId)
    {
        var user = _userManager.FindByIdAsync(userId).Result;
        if (user == null)
        {
            return null;
        }

        var role = _userManager.GetRolesAsync(user).Result;
        if (role.Count == 0)
        {
            return "Not Assigned";
        }

        return role[0];
    }

    public async Task<IdentityResult> AssignRole(string userId, string roleName)
    {
        var errorDict = new Dictionary<string, string>();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            errorDict["user"] = "User Not Found";
            return IdentityResult.Failed(new IdentityError
            {
                Code = "UserNotFound",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }

        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            errorDict["role"] = "Role Not Found";
            return IdentityResult.Failed(new IdentityError
            {
                Code = "RoleNotFound",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);
        if (result.Succeeded)
        {
            return IdentityResult.Success;
        }

        errorDict["general"] = "Role Assignment Failed";
        return IdentityResult.Failed(new IdentityError
        {
            Code = "RoleAssignmentFailed",
            Description = JsonSerializer.Serialize(errorDict)
        });
    }

    public async Task<IdentityResult> UpdateUserRole(string userId, string roleName)
    {
        var errorDict = new Dictionary<string, string>();
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            errorDict["user"] = "User Not Found";
            return IdentityResult.Failed(new IdentityError
            {
                Code = "UserNotFound",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }

        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            errorDict["role"] = "Role Not Found";
            return IdentityResult.Failed(new IdentityError
            {
                Code = "RoleNotFound",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Count != 0)
        {
            await _userManager.RemoveFromRoleAsync(user, roles[0]);
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);
        return result;
    }

    public async Task<string[]> GetRoles()
    {
        return await _roleManager.Roles.Select(role => role.Name).ToArrayAsync();
    }
}