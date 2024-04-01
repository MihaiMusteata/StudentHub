using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IStudentsService
{
    Task<List<Student>> GetStudents();
    Task<Student?> GetStudentById(int id);
    Task<Student?> GetStudentByUserId(string userId);
    Task<IdentityResult> CreateStudent(Student student);
    Task<IdentityResult> DeleteStudent(int id);
    Task<IdentityResult> UpdateStudent(Student student);
    Task<IdentityResult> EnrollStudent(EnrollData enrollData);
    Task<List<CourseInformation>> GetStudentCourses(int studentId);
}