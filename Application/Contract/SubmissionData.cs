namespace Application.Contract;

public class SubmissionData
{
  public int Id { get; set; }
  public DateTime SubmissionDate { get; set; }
  public DocumentMinimal DocumentData { get; set; }
}