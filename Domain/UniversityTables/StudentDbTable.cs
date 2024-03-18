using System.ComponentModel.DataAnnotations.Schema;


namespace Domain.UniversityTables;

public class StudentDbTable
{
    public int Id { get; set; }
    [ForeignKey("UserId")]
    public string UserId { get; set; }
    public virtual User.User User { get; set; }
    public int Year { get; set; }
    [ForeignKey("DepartmentId")]
    public int DepartmentId { get; set; }
    public virtual DepartmentDbTable Department { get; set; }
    public string EnrollmentNumber { get; set; }
    public string DegreeType { get; set; }
    public string FinanceType { get; set; }
    [ForeignKey("FacultyId")]
    public int FacultyId { get; set; }
    public virtual FacultyDbTable Faculty { get; set; }
    [ForeignKey("UniversityId")]
    public int UniversityId { get; set; }
    public virtual UniversityDbTable University { get; set; }
    [ForeignKey("GroupId")]
    public int GroupId { get; set; }
    public virtual GroupDbTable Group { get; set; }
    public string StudyFrequency { get; set; }
    [ForeignKey("SpecialtyId")]
    public int SpecialtyId { get; set; }
    public virtual SpecialtyDbTable Specialty { get; set; }
    public string ScholarshipType { get; set; }
    public DateTime EnrollmentDate { get; set; }
    public DateTime GraduationDate { get; set; }
}