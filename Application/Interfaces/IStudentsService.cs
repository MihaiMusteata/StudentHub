using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IStudentsService
{
    Task<List<Student>> GetStudents();
    Task<Student?> GetStudent(int id);
    Task<IdentityResult> CreateStudent(Student student);
    Task<IdentityResult> DeleteStudent(int id);
    Task<IdentityResult> UpdateStudent(Student student);
}