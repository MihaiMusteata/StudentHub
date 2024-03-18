namespace Application.Contract;

public class Teacher
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserId { get; set; }
    public DateTime BirthDate { get; set; }
    public int DisciplineId { get; set; }
    public int UniversityId { get; set; }
}