using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class SubmissionDbTable
{
  public int Id { get; set; }
  [ForeignKey("StudentId")]
  public int StudentId { get; set; }
  public virtual StudentDbTable Student { get; set; }
  [ForeignKey("CourseLessonId")]
  public int CourseLessonId { get; set; }
  public virtual CourseLessonDbTable CourseLesson { get; set; }
  [ForeignKey("DocumentId")]
  public int DocumentId { get; set; }
  public virtual DocumentDbTable Document { get; set; }
}