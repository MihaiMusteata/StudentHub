namespace Application.Contract;

public class StudentAttendanceInfo
{
  public int Id { get; set; }
  public string FirstName { get; set; }
  public string LastName { get; set; }
  public bool Enrolled { get; set; }
  public string Status { get; set; }
}