namespace Application.Contract;

public class StudentSubmissions
{
  public int StudentId { get; set; }
  public string? StudentName { get; set; }
  public GradeMinimalInfo? Grade { get; set; }
  public List<SubmissionData>? Submissions { get; set; }
}