using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class EnrolledStudentsDbTable
{
  public int Id { get; set; }
  [ForeignKey("CourseId")]
  public int CourseId { get; set; }
  public virtual CourseDbTable Course { get; set; }
  [ForeignKey("StudentId")]
  public int StudentId { get; set; }
  public virtual StudentDbTable Student { get; set; }
}