using Application.Interfaces;
using Domain.User;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;

namespace Application.Services;

public class ProfileService : IProfileService
{
    private readonly UserManager<User> _userManager;
    public ProfileService(UserManager<User> userManager)
    {
        _userManager = userManager;
    }
    public async Task<User> GetProfileByToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jsonToken = handler.ReadToken(token) as JwtSecurityToken;
        if (jsonToken?.ValidTo < DateTime.UtcNow)
        {
            return null;
        }
        var userId = jsonToken?.Claims.First(claim => claim.Type == "Id").Value;
        var user = await _userManager.FindByIdAsync(userId);
        return user;
    }
    
}