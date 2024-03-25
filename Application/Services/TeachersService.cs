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

public class TeachersService : ITeachersService
{
  private readonly IMapper _mapper;
  private readonly StudentHubContext _context;
  private readonly IdentityUserManager _userManager;

  public TeachersService(IMapper mapper, IdentityUserManager userManager, StudentHubContext context)
  {
    _mapper = mapper;
    _userManager = userManager;
    _context = context;
  }

  public async Task<List<Teacher>> GetTeachers()
  {
    var teachers = await _context.Teachers
      .Include(t => t.User)
      .Include(t => t.University)
      .ToListAsync();
    var teacherList = _mapper.Map<List<Teacher>>(teachers);
    return teacherList;
  }

  public async Task<Teacher?> GetTeacherById(int id)
  {
    var teacher = await _context.Teachers
      .Include(t => t.User)
      .Include(t => t.University)
      .FirstOrDefaultAsync(t => t.Id == id);
    var result = _mapper.Map<Teacher>(teacher);
    return result;
  }
  
  public async Task<Teacher?> GetTeacherByUserId(string userId)
  {
    var teacher = await _context.Teachers
      .Include(t => t.User)
      .Include(t => t.University)
      .FirstOrDefaultAsync(t => t.UserId == userId);
    var result = _mapper.Map<Teacher>(teacher);
    return result;
  }

  public async Task<IdentityResult> CreateTeacher(Teacher teacher)
  {
    var errorDict = new Dictionary<string, string>();

    var teacherExists = await _context.Teachers.AnyAsync(t => t.UserId == teacher.UserId);
    if (teacherExists)
    {
      errorDict["general"] = string.Format(ErrorTemplate.ItemExists, "Teacher");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "TeacherExists",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    var user = await _userManager.FindByIdAsync(teacher.UserId);
    var university = await _context.Universities.FindAsync(teacher.UniversityId);

    var objectsToCheck = new List<(string, object)>
    {
      ("User", user),
      ("University", university)
    };

    var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    var newTeacher = new TeacherDbTable();

    _mapper.Map(teacher, newTeacher);

    try
    {
      await _context.Teachers.AddAsync(newTeacher);
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException ex)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "creating teacher");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> DeleteTeacher(int id)
  {
    var errorDict = new Dictionary<string, string>();

    var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Id == id);

    var checkResult = ErrorChecker.CheckNullObjects(new List<(string, object?)>
    {
      ("Teacher", teacher)
    });

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    _context.Teachers.Remove(teacher!);

    try
    {
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException ex)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "deleting teacher");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }

  public async Task<IdentityResult> UpdateTeacher(Teacher teacher)
  {
    var errorDict = new Dictionary<string, string>();
    var oldUser = await _userManager.FindByIdAsync(teacher.UserId);
    var oldTeacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Id == teacher.Id);
    var university = await _context.Universities.FindAsync(teacher.UniversityId);

    var objectsToCheck = new List<(string, object?)>
    {
      ("User", oldUser),
      ("Teacher", oldTeacher),
      ("University", university)
    };

    var checkResult = ErrorChecker.CheckNullObjects(objectsToCheck);

    if (!checkResult.Succeeded)
    {
      return checkResult;
    }

    oldUser!.FirstName = teacher.FirstName;
    oldUser.LastName = teacher.LastName;
    oldUser.BirthDate = teacher.BirthDate;
    var userResult = await _userManager.UpdateAsync(oldUser);
    if (!userResult.Succeeded)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "updating user");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }

    _mapper.Map(teacher, oldTeacher);

    try
    {
      await _context.SaveChangesAsync();
      return IdentityResult.Success;
    }
    catch (DbUpdateException ex)
    {
      errorDict["general"] = string.Format(ErrorTemplate.DatabaseUpdateError, "updating teacher");
      return IdentityResult.Failed(new IdentityError
      {
        Code = "DatabaseUpdateError",
        Description = JsonSerializer.Serialize(errorDict)
      });
    }
  }
}