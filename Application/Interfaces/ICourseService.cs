using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface ICourseService
{
  Task<IdentityResult> CreateCourse(CourseForm courseData);
  Task<IdentityResult> CreateAccessKey(AccessData accessData);
  Task<IdentityResult> AssignTeacherToCourse(int courseId, int teacherId);
  Task<IdentityResult> RemoveTeacherFromCourse(int courseId, int teacherId);
  Task<List<string>> GetEnrolledGroups(int courseId);
  Task<List<CourseInformation>> GetTeacherCourses(int teacherId);
  Task<List<Teacher>> GetCourseTeachers(int courseId);
  Task<List<Teacher>> GetAvailableTeachers(int courseId);
  Task<CourseInformation?> GetCourse(int courseId);
  Task<List<LessonData>> GetCourseLessons(int courseId);
  Task<List<AccessKeyData>> GetCourseAccessKeys(int courseId);
  Task<IdentityResult> DeleteAccessKey(AccessKeysData accessKeysIds);
}