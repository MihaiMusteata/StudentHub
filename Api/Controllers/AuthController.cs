using Application.Contract;
using Application.Interfaces;
using Domain.User;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)   
        {
            _authService = authService;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(ULoginData data)
        {
            var result = await _authService.UserLogin(data);
            if (result.Succeeded)
            {
                var tokenString = _authService.GenerateJwtToken(data);
                Response.Cookies.Append("jwt", tokenString, new CookieOptions
                {
                    HttpOnly = true
                });
                return Ok("Login Successful");
            }
            
            return new UnauthorizedObjectResult(result.Errors.Select(error => error.Description));
        }
        
        [HttpPost("signup")]
        public async Task<IActionResult> Signup(USignupData data)
        {
            var result = await _authService.UserSignup(data);
            if (result.Succeeded)
            {
                return Ok("Signup Successful");
            }
            
            return BadRequest(result.Errors.Select(error => error.Description));
        }
    }
}
