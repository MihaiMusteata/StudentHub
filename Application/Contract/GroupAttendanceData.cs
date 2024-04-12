namespace Application.Contract;

public class GroupAttendanceData
{
  public int CourseId { get; set; }
  public int CourseLessonId { get; set; }
  public int GroupId { get; set; }
  public DateTime Date { get; set; }
}