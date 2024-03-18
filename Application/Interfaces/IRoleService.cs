using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IRoleService
{
    Task<IdentityResult> CreateRole(string roleName);
    string GetUserRole(string userId);
    Task<IdentityResult> AssignRole(string userId, string roleName);
    Task<IdentityResult> UpdateUserRole(string userId, string roleName);
    Task<string[]> GetRoles();
}