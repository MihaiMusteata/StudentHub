using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Application.Contract;
using Application.Identity;
using Application.Interfaces;
using Domain.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;


namespace Application.Services;

public class AuthService : IAuthService
{
    private readonly IdentityUserManager _userManager;
    private readonly IConfiguration _configuration;
    private readonly IRoleService _roleService;

    public AuthService(IdentityUserManager userManager, IConfiguration confguration, IRoleService roleService)
    {
        _configuration = confguration;
        _userManager = userManager;
        _roleService = roleService;
    }

    public async Task<IdentityResult> UserSignup(USignupData data)
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
            return IdentityResult.Success;
        }

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

        return IdentityResult.Failed(new IdentityError
        {
            Code = "SignupFailed",
            Description = JsonSerializer.Serialize(errorDict)
        });
    }

    public async Task<IdentityResult> UserLogin(ULoginData data)
    {
        var user = await _userManager.FindByEmailAsync(data.Credential) ?? await _userManager.FindByNameAsync(data.Credential);
       
        if (user != null && await _userManager.CheckPasswordAsync(user, data.Password))
        {
            return IdentityResult.Success;
        }

        var errorDict = new Dictionary<string, string>();

        if (user == null)
        {
            errorDict["credentials"] = "Invalid Username or Email";
        }
        else
        {
            errorDict["password"] = "Invalid Password";
        }
    
        return IdentityResult.Failed(new IdentityError
        {
            Code = "InvalidLogin",
            Description = JsonSerializer.Serialize(errorDict)
        });
    }

    public string GenerateJwtToken(ULoginData data)
    {
        var email_validator = new EmailAddressAttribute();
        User user;
        if (email_validator.IsValid(data.Credential))
        {
            user = _userManager.FindByEmailAsync(data.Credential).Result;
        }
        else
        {
            user = _userManager.FindByNameAsync(data.Credential).Result;
        }

        var role = _roleService.GetUserRole(user.Id);

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

        SigningCredentials signingCred = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha512Signature);

        var secuirtyToken = new JwtSecurityToken(
            claims: new List<Claim>
            {
                new Claim(ClaimTypes.Role, role),
                new Claim("Id", user.Id),
            },
            expires: DateTime.Now.AddDays(1),
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            signingCredentials: signingCred);

        var token = new JwtSecurityTokenHandler().WriteToken(secuirtyToken);

        return token;
    }
}