using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class CourseDbTable
{
  public int Id { get; set; }
  [ForeignKey("DisciplineId")]
  public int DisciplineId { get; set; }
  public virtual DisciplineDbTable Discipline { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
  public string Code { get; set; }
  
}