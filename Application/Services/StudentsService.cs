using System.Text.Json;
using Application.Contract;
using Application.Helpers;
using Application.Identity;
using Application.Interfaces;
using Application.Resources;
using AutoMapper;
using Domain.UniversityTables;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class StudentsService : IStudentsService
{
    private readonly IdentityUserManager _userManager;
    private readonly StudentHubContext _context;
    private readonly IMapper _mapper;

    public StudentsService(IdentityUserManager userManager, StudentHubContext context, IMapper mapper)
    {
        _userManager = userManager;
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<Student>> GetStudents()
    {
        var students = await _context.Students
            .Include(s => s.Faculty)
            .Include(s => s.Specialty)
            .Include(s => s.Department)
            .Include(s => s.University)
            .Include(s => s.User)
            .ToListAsync();
        var studentList = _mapper.Map<List<Student>>(students);
        return studentList;
    }

    public async Task<Student?> GetStudent(int id)
    {
        var student = await _context.Students
            .Include(s => s.Faculty)
            .Include(s => s.Specialty)
            .Include(s => s.Department)
            .Include(s => s.University)
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);
        var result = _mapper.Map<Student>(student);
        return result;
    }
    
    public async Task<IdentityResult> CreateStudent(Student student)
    {
        var errorDict = new Dictionary<string, string>();

        var studentExists = await _context.Students.AnyAsync(s => s.UserId == student.UserId);
        if (studentExists)
        {
            errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Student");
            return IdentityResult.Failed(new IdentityError
            {
                Code = "StudentExists",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }

        var user = _userManager.FindByIdAsync(student.UserId).Result;
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == student.DepartmentId);
        var faculty = await _context.Faculties.FirstOrDefaultAsync(f => f.Id == student.FacultyId);
        var specialty = await _context.Specialties.FirstOrDefaultAsync(s => s.Id == student.SpecialtyId);
        var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == student.UniversityId);

        var objectsToCheck = new List<(string, object)>
        {
            ("User", user),
            ("University", university),
            ("Department", department),
            ("Faculty", faculty),
            ("Specialty", specialty)
        };

        var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

        if (!checkResult.Succeeded)
        {
            return checkResult;
        }

        var objectsToCheck2 = new List<(object, object, string, string)>
        {
            (department!.FacultyId, student.FacultyId, "Department", "Faculty"),
            (faculty!.UniversityId, student.UniversityId, "Faculty", "University"),
            (specialty!.FacultyId, student.FacultyId, "Specialty", "Faculty")
        };

        var checkResult2 = ErrorChecker.CheckMismatch(objectsToCheck2);

        if (!checkResult2.Succeeded)
        {
            return checkResult2;
        }

        var newStudent = new StudentDbTable();

        _mapper.Map(student, newStudent);
        
        try
        {
            await _context.Students.AddAsync(newStudent);
            await _context.SaveChangesAsync();
            return IdentityResult.Success;
        }
        catch (DbUpdateException ex)
        {
            errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "creating student");
            return IdentityResult.Failed(new IdentityError
            {
                Code = "DatabaseUpdateError",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }
    }

    public async Task<IdentityResult> DeleteStudent(int id)
    {
        var errorDict = new Dictionary<string, string>();

        var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == id);
        
        var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object)> {("Student", student)});
        if (!checkResult.Succeeded)
        {
            return checkResult;
        }

        _context.Students.Remove(student!);
        try
        {
            await _context.SaveChangesAsync();
            return IdentityResult.Success;
        }
        catch (DbUpdateException ex)
        {
            errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "deleting student");
            return IdentityResult.Failed(new IdentityError
            {
                Code = "DatabaseUpdateError",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }
    }

    public async Task<IdentityResult> UpdateStudent(Student student)
    {
        var errorDict = new Dictionary<string, string>();
        
        var oldStudent = await _context.Students.FirstOrDefaultAsync(s => s.Id == student.Id);
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == student.DepartmentId);
        var faculty = await _context.Faculties.FirstOrDefaultAsync(f => f.Id == student.FacultyId);
        var specialty = await _context.Specialties.FirstOrDefaultAsync(s => s.Id == student.SpecialtyId);
        var university = await _context.Universities.FirstOrDefaultAsync(u => u.Id == student.UniversityId);

        var oldUser = await _userManager.FindByIdAsync(student.UserId);

        var objectsToCheck = new List<(string, object)>
        {
            ("Student", oldStudent),
            ("User", oldUser),
            ("University", university),
            ("Department", department),
            ("Faculty", faculty),
            ("Specialty", specialty)
        };

        var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

        if (!checkResult.Succeeded)
        {
            return checkResult;
        }

        var objectsToCheck2 = new List<(object, object, string, string)>
        {
            (department!.FacultyId, student.FacultyId, "Department", "Faculty"),
            (faculty!.UniversityId, student.UniversityId, "Faculty", "University"),
            (specialty!.FacultyId, student.FacultyId, "Specialty", "Faculty")
        };

        var checkResult2 = ErrorChecker.CheckMismatch(objectsToCheck2);

        if (!checkResult2.Succeeded)
        {
            return checkResult2;
        }

        oldUser!.FirstName = student.FirstName;
        oldUser.LastName = student.LastName;
        oldUser.BirthDate = student.BirthDate;
        var resultUser = await _userManager.UpdateAsync(oldUser);
        if (!resultUser.Succeeded)
        {
            errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "updating user");
            return IdentityResult.Failed(new IdentityError
            {
                Code = "DatabaseUpdateError",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }

        _mapper.Map(student, oldStudent);

        try
        {
            await _context.SaveChangesAsync();
            return IdentityResult.Success;
        }
        catch (DbUpdateException ex)
        {
            errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "updating student");
            return IdentityResult.Failed(new IdentityError
            {
                Code = "DatabaseUpdateError",
                Description = JsonSerializer.Serialize(errorDict)
            });
        }
    }
}