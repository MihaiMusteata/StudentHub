using Application.Contract;

namespace Application.Interfaces;

public interface IGroupService
{
  Task<List<StudentMinimal>> GetGroupStudents(int groupId);
}