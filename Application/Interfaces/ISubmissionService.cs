using Application.Contract;

namespace Application.Interfaces;

public interface ISubmissionService
{
  Task<List<StudentSubmissions>?> GetStudentSubmissions(GroupSubmissionsData form);
}