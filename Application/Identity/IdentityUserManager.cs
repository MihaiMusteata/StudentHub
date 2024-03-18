using System.ComponentModel.DataAnnotations;
using Domain.User;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Application.Identity;

public class IdentityUserManager : UserManager<User>
{
    public StudentHubContext _databaseContext { get; set; }

    public IdentityUserManager(IUserStore<User> store, IOptions<IdentityOptions> optionsAccessor,
        IPasswordHasher<User> passwordHasher, IEnumerable<IUserValidator<User>> userValidators,
        IEnumerable<IPasswordValidator<User>> passwordValidators, ILookupNormalizer keyNormalizer,
        IdentityErrorDescriber errors, IServiceProvider services, ILogger<UserManager<User>> logger,
        StudentHubContext databaseContext)
        : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors,
            services, logger)
    {
        _databaseContext = databaseContext;
    }

    public override async Task<IdentityResult> CreateAsync(User user, string password)
    {
        var errors = new List<IdentityError>();
        var emailTaken = _databaseContext.Users.FirstOrDefault(u => u.Email == user.Email);
        if (emailTaken != null)
        {
            errors.Add(new IdentityError
            {
                Code = "EmailTaken",
                Description = "Email is already taken"
            });
        }
        else
        {
            var result = await base.CreateAsync(user, password);
            if (result.Succeeded)
            {
                return IdentityResult.Success;
            }

            foreach (var error in result.Errors)
            {
                errors.Add(error);
            }
        }

        return IdentityResult.Failed(errors.ToArray());
    }

    public override async Task<IdentityResult> UpdateAsync(User user)
    {
        var errors = new List<IdentityError>();
        var emailTaken = _databaseContext.Users.FirstOrDefault(u => u.Email == user.Email);
        if (emailTaken != null && emailTaken.Id != user.Id)
        {
            errors.Add(new IdentityError
            {
                Code = "EmailTaken",
                Description = "Email is already taken"
            });
        }
        else
        {
            var result = await base.UpdateAsync(user);
            if (result.Succeeded)
            {
                return IdentityResult.Success;
            }

            foreach (var error in result.Errors)
            {
                errors.Add(error);
            }
        }

        return IdentityResult.Failed(errors.ToArray());
    }

    public override async Task<IdentityResult> DeleteAsync(User user)
    {
        var userRole = _databaseContext.UserRoles.FirstOrDefault(ur => ur.UserId == user.Id);
        var role = _databaseContext.Roles.FirstOrDefault(r => userRole != null && r.Id == userRole.RoleId);
        var result = await base.DeleteAsync(user);
        if (result.Succeeded)
        {
            switch (role?.Name)
            {
                case "Student":
                    var student = await _databaseContext.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
                    if (student is not null)
                    {
                        _databaseContext.Students.Remove(student);
                        await _databaseContext.SaveChangesAsync();
                    }
                    break;
                case "Teacher":
                    var teacher = await _databaseContext.Teachers.FirstOrDefaultAsync(t => t.UserId == user.Id);
                    if (teacher is not null)
                    {
                        _databaseContext.Teachers.Remove(teacher);
                        await _databaseContext.SaveChangesAsync();
                    }
                    break;
            }

            return IdentityResult.Success;
        }

        return IdentityResult.Failed(result.Errors.ToArray());
    }
}