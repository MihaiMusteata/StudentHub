using Application.Contract;
using Application.Interfaces;
using Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class GroupService : IGroupService
{
  private readonly StudentHubContext _context;
  public GroupService(StudentHubContext context)
  {
    _context = context;
  }
  public async Task<List<StudentMinimal>> GetGroupStudents(int groupId)
  {
    var students =  await _context.Students
      .Where(s => s.GroupId == groupId)
      .Select(s => new StudentMinimal
      {
        Id = s.Id,
        FirstName = s.User.FirstName,
        LastName = s.User.LastName,
      })
      .ToListAsync();
    return students;
  }
  
}