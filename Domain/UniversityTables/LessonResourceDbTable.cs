using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class LessonResourceDbTable
{
  public int Id { get; set; }
  [ForeignKey("CourseLessonId")]
  public int CourseLessonId { get; set; }
  public virtual CourseLessonDbTable CourseLesson { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
  [ForeignKey("DocumentId")]
  public int DocumentId { get; set; }
  public virtual DocumentDbTable Document { get; set; }
}