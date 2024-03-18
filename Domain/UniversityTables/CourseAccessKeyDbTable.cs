using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class CourseAccessKeyDbTable
{
  public int Id { get; set; }
  [ForeignKey("CourseId")]
  public int CourseId { get; set; }
  public virtual CourseDbTable Course { get; set; }
  [ForeignKey("GroupId")]
  public int GroupId { get; set; }
  public virtual GroupDbTable Group { get; set; }
  public string AccessKey { get; set; }
}