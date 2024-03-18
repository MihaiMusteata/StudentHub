using Api.Models;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly IRoleService _roleService;
        public ProfileController(IProfileService profileService, IRoleService roleService)
        {
            _roleService = roleService;
            _profileService = profileService;
        }
        
        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            string token = Request.Cookies["jwt"];
            if (token == null)
            {
                return BadRequest("No token found");
            }
            var result = await _profileService.GetProfileByToken(token);
            if (result != null)
            {
                Profile profile = new Profile
                {
                    Id = result.Id,
                    UserName = result.UserName,
                    Role = _roleService.GetUserRole(result.Id)
                };
                return Ok(profile);
            }
            return BadRequest("Token expired");
        }
    
    }
}