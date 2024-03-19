using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface ICourseService
{
  Task<IdentityResult> CreateCourse(CourseData courseData);
  Task<List<CourseData>> GetTeacherCourses(int teacherId);
  Task<IdentityResult> AssignTeacherToCourse(int courseId, int teacherId);
}