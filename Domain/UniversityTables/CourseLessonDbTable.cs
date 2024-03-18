using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class CourseLessonDbTable
{
  public int Id { get; set; }
  [ForeignKey("CourseId")]
  public int CourseId { get; set; }
  public virtual CourseDbTable Course { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
}