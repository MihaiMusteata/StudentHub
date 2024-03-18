using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.UniversityTables;

public class TeacherDbTable
{
    public int Id { get; set; }
    [ForeignKey("UserId")]
    public string UserId { get; set; }
    public virtual User.User User { get; set; }
    [ForeignKey("UniversityId")]
    public int UniversityId { get; set; }
    public virtual UniversityDbTable University { get; set; }
}