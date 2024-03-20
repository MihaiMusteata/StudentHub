using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface ITeachersService
{
    Task<List<Teacher>> GetTeachers();
    Task<Teacher?> GetTeacherById(int id);
    Task<Teacher?> GetTeacherByUserId(string userId);
    Task<IdentityResult> CreateTeacher(Teacher teacher);
    Task<IdentityResult> DeleteTeacher(int id);
    Task<IdentityResult> UpdateTeacher(Teacher teacher);
}