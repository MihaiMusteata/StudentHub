using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IStudentsService
{
  Task<List<Student>> GetStudents();
  Task<Student?> GetStudentById(int id);
  Task<Student?> GetStudentByUserId(string userId);
  Task<IdentityResult> CreateStudent(Student student);
  Task<IdentityResult> DeleteStudent(int id);
  Task<IdentityResult> UpdateStudent(Student student);
  Task<IdentityResult> EnrollStudent(EnrollData enrollData);
  Task<IdentityResult> UnenrollStudent(int studentId, int courseId);
  Task<List<CourseInformation>> GetStudentCourses(int studentId);
  Task<IdentityResult> UploadSubmission(int studentId, int lessonAssignmentId, DocumentData documentData);
  Task<StudentSubmissions> GetSubmissions(int studentId, int lessonAssignmentId);
  Task<List<StudentGrades>> GetStudentGrades(int studentId, int courseId);
}