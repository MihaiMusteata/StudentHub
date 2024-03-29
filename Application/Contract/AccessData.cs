namespace Application.Contract;

public class AccessData
{
  public int CourseId { get; set; }
  public List<int> GroupsIds { get; set; }
  public string AccessKey { get; set; }
}

public class AccessKeyData
{
  public int Id { get; set; }
  public string GroupName { get; set; }
  public string AccessKey { get; set; }
}

public class AccessKeysData
{
  public List<int> AccessKeys { get; set; }
}