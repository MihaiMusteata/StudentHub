using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class LessonAssignmentDbTable
{
  public int Id { get; set; }
  [ForeignKey("CourseLessonId")]
  public int CourseLessonId { get; set; }
  public virtual CourseLessonDbTable CourseLesson { get; set; }
  public string Name { get; set; }
  public string Task { get; set; }
  public bool AllowSubmission { get; set; }
  public DateTime DueDate { get; set; }
}