using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class GradeDbTable
{
  public int Id { get; set; }
  [ForeignKey("AssignmentId")]
  public int AssignmentId { get; set; }
  public virtual LessonAssignmentDbTable Assignment { get; set; }
  [ForeignKey("StudentId")]
  public int StudentId { get; set; }
  public virtual StudentDbTable Student { get; set; }
  public int Grade { get; set; }
  public string TeacherName { get; set; }
}