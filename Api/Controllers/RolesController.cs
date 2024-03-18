using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpPost("role")]
        public async Task<IActionResult> Role(string roleName)
        {
            var result = await _roleService.CreateRole(roleName);
            if (result.Succeeded)
            {
                return Ok("Role Created");
            }

            string errors = "";
            foreach (var error in result.Errors)
            {
                errors += error.Description + "\n";
            }

            return BadRequest(errors);
        }
        
        [HttpGet("user_role")]
        public IActionResult UserRole(string userId)
        {
            var role = _roleService.GetUserRole(userId);
            if (role == null)
            {
                return BadRequest("User Not Found");
            }
            return Ok(role);
        }
        
        [HttpPost("assign_role")]
        public async Task<IActionResult> AssignRole(string userId, string roleName)
        {
            var result = await _roleService.AssignRole(userId, roleName);
            if (result.Succeeded)
            {
                return Ok("Role Assigned");
            }

            var errors = new List<string>();
            foreach (var error in result.Errors)
            {
                errors.Add(error.Description);
            }

            return BadRequest(errors);
        }
        
        [HttpGet("roles")]
        public async Task<IActionResult> Roles()
        {
            var result = await _roleService.GetRoles();
            return Ok(result);
        }
    }
}