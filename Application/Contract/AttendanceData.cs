namespace Application.Contract;

public class AttendanceData
{
  public int CourseLessonId { get; set; }
  public List<StudentAttendanceData> AttendanceList { get; set; }
  public DateTime Date { get; set; }
}

public class StudentAttendanceData
{
  public int StudentId { get; set; }
  public string Status { get; set; }
}