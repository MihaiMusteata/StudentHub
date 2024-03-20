using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class FileData
{
  public string fileName { get; set; }
  public string content { get; set; }
  public string contentType { get; set; }
}

[Route("api/[controller]")]
[ApiController]
public class TestController : ControllerBase
{
  public FileData testFile = new FileData
  {
    fileName = "test.pdf",
    contentType = "application/pdf",
    content =
  };

  private readonly IWebHostEnvironment _hostingEnvironment;

  public TestController(IWebHostEnvironment hostingEnvironment)
  {
    _hostingEnvironment = hostingEnvironment;
  }

  [HttpPost("upload")]
  public async Task<IActionResult> UploadPDF(IFormFile file)
  {
    try
    {
      if (file.Length > 0)
      {
        using (var ms = new MemoryStream())
        {
          file.CopyTo(ms);
          var fileBytes = ms.ToArray();
          string s = Convert.ToBase64String(fileBytes);
          return Ok(new
          {
            content = s,
            fileName = file.FileName,
            contentType = file.ContentType
          });
        }
      }
      else
      {
        return BadRequest("File is empty");
      }
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Internal server error: {ex}");
    }
  }

  [HttpGet("download")]
  public IActionResult Download(int id)
  {
    try
    {
      byte[] content = Convert.FromBase64String(testFile.content);
      return File(content, testFile.contentType, testFile.fileName);
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Internal server error: {ex}");
    }
  }
}