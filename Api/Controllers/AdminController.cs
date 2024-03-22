using Application.Interfaces;
using Application.Resources;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminPanelService _adminPanelService;
        private readonly IRoleService _roleService;

        public AdminController(IAdminPanelService adminPanelService, IRoleService roleService)
        {
            _roleService = roleService;
            _adminPanelService = adminPanelService;
        }

        /// <summary>
        /// Database Getters
        /// </summary>


        [HttpGet("universities")]
        public async Task<IActionResult> GetUniversities()
        {
            var result = await _adminPanelService.GetUniversities();
            if (result.Count == 0)
            {
                return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Universities"));
            }

            return Ok(result);
        }

        [HttpGet("faculties")]
        public async Task<IActionResult> GetFaculties()
        {
            var result = await _adminPanelService.GetFaculties();
            if (result.Count == 0)
            {
                return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Faculties"));
            }

            return Ok(result);
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var result = await _adminPanelService.GetDepartments();
            if (result.Count == 0)
            {
                return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Departments"));
            }

            return Ok(result);
        }

        [HttpGet("specialties")]
        public async Task<IActionResult> GetSpecialties()
        {
            var result = await _adminPanelService.GetSpecialties();
            if (result.Count == 0)
            {
                return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Specialties"));
            }

            return Ok(result);
        }

        [HttpGet("disciplines")]
        public async Task<IActionResult> GetDisciplines()
        {
            var result = await _adminPanelService.GetDisciplines();
            if (result.Count == 0)
            {
                return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Disciplines"));
            }

            return Ok(result);
        }
        
        [HttpGet("groups")]
        public async Task<IActionResult> GetGroups()
        {
            var result = await _adminPanelService.GetGroups();
            if (result.Count == 0)
            {
                return NotFound(string.Format(ErrorTemplate.NoItemsFound, "Groups"));
            }

            return Ok(result);
        }

     
    }
}