using FluentValidation;

namespace Application.Contract;
public class Student
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime BirthDate { get; set; }
    public string UserId { get; set; }
    public int DepartmentId { get; set; }
    public DateTime EnrollmentDate { get; set; }
    public string EnrollmentNumber { get; set; }
    public string FinanceType { get; set; }
    public int FacultyId { get; set; }
    public string StudyFrequency { get; set; }
    public int SpecialtyId { get; set; }
    public string ScholarshipType { get; set; }
    public DateTime GraduationDate { get; set; }
    public string DegreeType { get; set; }
    public int Year { get; set; }
    public int UniversityId { get; set; }
    public int GroupId { get; set; }
}
