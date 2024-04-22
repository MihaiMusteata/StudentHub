namespace Application.Contract;

public class GradeInfo : GradeMinimalInfo
{
  public int Id { get; set; }
  public int AssignmentId { get; set; }
  public int StudentId { get; set; }
}