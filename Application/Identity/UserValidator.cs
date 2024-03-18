using System.ComponentModel.DataAnnotations;
using Domain.User;
using Infrastructure;
using Microsoft.AspNetCore.Identity;

namespace Application.Identity;

public class UserValidator : IUserValidator<User>
{
    private readonly StudentHubContext _databaseContext;
    public UserValidator(StudentHubContext databaseContext)
    {
        _databaseContext = databaseContext;
    }
    
    public Task<IdentityResult> ValidateAsync(UserManager<User> manager, User user)
    {
        var errors = new List<IdentityError>();
        var emailValidator = new EmailAddressAttribute();
        if (!emailValidator.IsValid(user.Email))
        {
            errors.Add(new IdentityError
            {
                Code = "InvalidEmail",
                Description = "Invalid Email"
            });
        }
        if (errors.Count > 0)
        {
            return Task.FromResult(IdentityResult.Failed(errors.ToArray()));
        
        }
        
        return Task.FromResult(IdentityResult.Success);
    }
}