using Microsoft.AspNetCore.Identity;

namespace Domain.User;

public class User : IdentityUser
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime BirthDate { get; set; }
}