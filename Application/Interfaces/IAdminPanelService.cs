using Application.Contract;
using Domain.UniversityTables;
using Domain.User;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IAdminPanelService
{
    Task<List<UniversityDbTable>> GetUniversities();
    Task<List<FacultyDbTable>> GetFaculties();
    Task<List<DepartmentDbTable>> GetDepartments();
    Task<List<SpecialtyDbTable>> GetSpecialties();
    Task<List<DisciplineDbTable>> GetDisciplines();
    Task<List<GroupDbTable>> GetGroups();
}