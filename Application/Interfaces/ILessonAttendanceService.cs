using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface ILessonAttendanceService
{
  Task<IdentityResult> RecordLessonAttendance(AttendanceData form);
  Task<List<StudentAttendanceInfo>?> GetLessonAttendance(GroupAttendanceData form);
}