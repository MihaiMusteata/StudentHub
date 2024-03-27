namespace Application.Contract;

public class LessonAssignmentData: LessonAssignmentMinimal
{
  public int LessonId { get; set; }
  public string Task { get; set; }
  public bool AllowSubmission { get; set; }
  public DateTime DueDate { get; set; }
}