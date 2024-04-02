using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class AssignmentResourceDbTable
{
  public int Id { get; set; }
  [ForeignKey("LessonAssignmentId")]
  public int LessonAssignmentId { get; set; }
  public virtual LessonAssignmentDbTable LessonAssignment { get; set; }
  [ForeignKey("DocumentId")]
  public int DocumentId { get; set; }
  public virtual DocumentDbTable Document { get; set; }
  
}