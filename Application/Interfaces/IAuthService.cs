using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IAuthService
{
    Task<IdentityResult> UserSignup(USignupData data);
    Task<IdentityResult> UserLogin(ULoginData data);
    string GenerateJwtToken(ULoginData userLogin);
}