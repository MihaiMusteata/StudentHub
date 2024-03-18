using Domain.User;

namespace Application.Interfaces;

public interface IProfileService
{
    Task<User> GetProfileByToken(string token);
}