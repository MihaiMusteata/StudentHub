using Application.Interfaces;
using AutoMapper;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Application.Identity;

namespace Application.Services;

public class AdminPanelService : IAdminPanelService
{
    private readonly IdentityUserManager _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly StudentHubContext _context;
    private readonly IMapper _mapper;

    public AdminPanelService(IdentityUserManager userManager, RoleManager<IdentityRole> roleManager,
        StudentHubContext context, IMapper mapper)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Database Getters
    /// </summary>

    public async Task<List<UniversityDbTable>> GetUniversities()
    {
        var universities = await _context.Universities.ToListAsync();
        return universities;
    }

    public async Task<List<FacultyDbTable>> GetFaculties()
    {
        var faculties = await _context.Faculties.ToListAsync();
        return faculties;
    }

    public async Task<List<DepartmentDbTable>> GetDepartments()
    {
        var departments = await _context.Departments.ToListAsync();
        return departments;
    }

    public async Task<List<SpecialtyDbTable>> GetSpecialties()
    {
        var specialties = await _context.Specialties.ToListAsync();
        return specialties;
    }

    public async Task<List<DisciplineDbTable>> GetDisciplines()
    {
        var disciplines = await _context.Disciplines.ToListAsync();
        return disciplines;
    }
    
    public async Task<List<GroupDbTable>> GetGroups()
    {
        var groups = await _context.Groups.ToListAsync();
        return groups;
    }


}