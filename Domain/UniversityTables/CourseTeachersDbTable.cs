using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class CourseTeachersDbTable
{
  public int Id { get; set; }
  [ForeignKey("CourseId")]
  public int CourseId { get; set; }
  public virtual CourseDbTable Course { get; set; }
  [ForeignKey("TeacherId")]
  public int TeacherId { get; set; }
  public virtual TeacherDbTable Teacher { get; set; }
}