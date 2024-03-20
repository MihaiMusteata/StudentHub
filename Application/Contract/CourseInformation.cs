namespace Application.Contract;

public class CourseInformation
{
  public int Id { get; set; }
  public string Discipline { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
  public string Code { get; set; }
  public List<string> EnrolledGroups { get; set; }
}