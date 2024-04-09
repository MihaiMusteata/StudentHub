using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class LessonAttendanceDbTable
{
  public int Id { get; set; }
  [ForeignKey("CourseLessonId")]
  public int CourseLessonId { get; set; }
  public virtual CourseLessonDbTable CourseLesson { get; set; }
  [ForeignKey("StudentId")]
  public int StudentId { get; set; }
  public virtual StudentDbTable Student { get; set; }
  public string Status { get; set; }
  public DateTime Date { get; set; }
}