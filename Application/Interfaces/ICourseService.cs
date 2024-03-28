using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface ICourseService
{
  Task<IdentityResult> CreateCourse(CourseForm courseData);
  Task<IdentityResult> AssignTeacherToCourse(int courseId, int teacherId);
  Task<List<string>> GetEnrolledGroups(int courseId);
  Task<List<CourseInformation>> GetTeacherCourses(int teacherId);
  Task<CourseInformation?> GetCourse(int courseId);
  Task<List<LessonData>> GetCourseLessons(int courseId);
}