using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GroupController : ControllerBase
{
  private readonly ILogger<GroupController> _logger;
  private readonly IGroupService _groupService;
  public GroupController(IGroupService groupService, ILogger<GroupController> logger)
  {
    _groupService = groupService;
    _logger = logger;
  }
  
  [HttpGet("students/{groupId}")]
  public async Task<IActionResult> GetGroupStudents(int groupId)
  {
    var students = await _groupService.GetGroupStudents(groupId);
    if (students.Count == 0)
    {
      return NotFound("No students found in this group");
    }
    return Ok(students);
  }

}