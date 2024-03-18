using Application.Contract;
using Domain.User;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IUsersService
{
    Task<List<User>> GetUsers();
    Task<User?> GetUser(string id);
    Task<IdentityResult> CreateUser(NewUserData data);
    Task<IdentityResult> DeleteUser(string id);
    Task<IdentityResult> UpdateUser(User user);
}