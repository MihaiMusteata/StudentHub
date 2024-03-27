using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface ILessonAssignmentService
{
  Task<IdentityResult> CreateLessonAssignment(LessonAssignmentData lessonAssignmentData);
  Task<LessonAssignmentData?> GetLessonAssignment(int id);
  Task<List<LessonAssignmentMinimal>> GetLessonAssignments(int lessonId);
  Task<IdentityResult> DeleteLessonAssignment(int id);
  Task<IdentityResult> UpdateLessonAssignment(LessonAssignmentData lessonAssignmentData);
}