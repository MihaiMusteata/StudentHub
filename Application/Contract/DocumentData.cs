namespace Application.Contract;

public class DocumentData: DocumentMinimal
{
  public byte[] Content { get; set; }
  public string FolderPath { get; set; }
}