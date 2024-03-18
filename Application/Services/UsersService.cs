using System.Text.Json;
using Application.Contract;
using Application.Helpers;
using Application.Identity;
using Application.Interfaces;
using Application.Resources;
using AutoMapper;
using Domain.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class UsersService : IUsersService
{
    private readonly IdentityUserManager _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IMapper _mapper;

    public UsersService(IdentityUserManager userManager, RoleManager<IdentityRole> roleManager, IMapper mapper)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _mapper = mapper;
    }

    public async Task<List<User>> GetUsers()
    {
        var result = await _userManager.Users.ToListAsync();
        return result;
    }

    public async Task<User?> GetUser(string id)
    {
        var result = await _userManager.FindByIdAsync(id);
        return result;
    }

    public async Task<IdentityResult> CreateUser(NewUserData data)
    {
        var errorDict = new Dictionary<string, string>();

        var user = new User
        {
            UserName = data.Username,
            Email = data.Email,
            BirthDate = data.BirthDate,
            FirstName = data.FirstName,
            LastName = data.LastName
        };

        var result = await _userManager.CreateAsync(user, data.Password);

        if (result.Succeeded)
        {
            if (!await _roleManager.RoleExistsAsync(data.Role))
            {
                await _userManager.DeleteAsync(user);
                errorDict["role"] = string.Format(ErrorTemplate.ItemNotFound, "Role");
            }
            else
            {
                var roleResult = await _userManager.AddToRoleAsync(user, data.Role);
                if (!roleResult.Succeeded)
                {
                    await _userManager.DeleteAsync(user);
                    errorDict["role"] = roleResult.Errors.First().Description;
                }
            }
        }
        else
        {
            foreach (var error in result.Errors)
            {
                switch (error.Description)
                {
                    case var s when s.Contains("Username"):
                        errorDict["username"] = error.Description;
                        break;
                    case var s when s.Contains("Email"):
                        errorDict["email"] = error.Description;
                        break;
                    default:
                        errorDict["general"] = error.Description;
                        break;
                }
            }
        }

        if (errorDict.Count == 0)
        {
            return IdentityResult.Success;
        }

        return IdentityResult.Failed(new IdentityError
        {
            Code = "CreateUserFailed",
            Description = JsonSerializer.Serialize(errorDict)
        });
    }

    public async Task<IdentityResult> DeleteUser(string userId)
    {
        var errorDict = new Dictionary<string, string>();

        var user = await _userManager.FindByIdAsync(userId);

        var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object)> { ("User", user) });
        if (!checkResult.Succeeded)
        {
            return checkResult;
        }

        var result = await _userManager.DeleteAsync(user);

        foreach (var error in result.Errors)
        {
            errorDict["general"] = error.Description;
        }

        if (errorDict.Count == 0)
        {
            return IdentityResult.Success;
        }

        return IdentityResult.Failed(new IdentityError
        {
            Code = "DeleteUserFailed",
            Description = JsonSerializer.Serialize(errorDict)
        });
    }

    public async Task<IdentityResult> UpdateUser(User user)
    {
        var errorDict = new Dictionary<string, string>();

        var oldUser = await _userManager.FindByIdAsync(user.Id);

        var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object)> { ("User", oldUser) });
        if (!checkResult.Succeeded)
        {
            return checkResult;
        }

        oldUser!.UserName = user.UserName;
        oldUser.Email = user.Email;
        oldUser.BirthDate = user.BirthDate;
        oldUser.FirstName = user.FirstName;
        oldUser.LastName = user.LastName;

        var result = await _userManager.UpdateAsync(oldUser);
        foreach (var error in result.Errors)
        {
            switch (error.Description)
            {
                case var s when s.Contains("Username"):
                    errorDict["username"] = error.Description;
                    break;
                case var s when s.Contains("Email"):
                    errorDict["email"] = error.Description;
                    break;
                default:
                    errorDict["general"] = error.Description;
                    break;
            }
        }

        if (errorDict.Count == 0)
        {
            return IdentityResult.Success;
        }

        return IdentityResult.Failed(new IdentityError
        {
            Code = "UpdateUserFailed",
            Description = JsonSerializer.Serialize(errorDict)
        });
    }
}