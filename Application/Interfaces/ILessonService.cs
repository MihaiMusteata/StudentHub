using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface ILessonService
{
  Task<IdentityResult> CreateLesson(LessonData lessonData);
  Task<LessonData?> GetLesson(int id);
  Task<List<DocumentMinimal>> GetLessonDocuments(int lessonId);
  Task<IdentityResult> UploadDocumentToLesson(int lessonId, DocumentData documentData);
  Task<IdentityResult> DeleteDocumentFromLesson(int lessonId, int documentId);
  Task<IdentityResult> DeleteLesson(int id);
  Task<IdentityResult> UpdateLesson(LessonData lessonData);
}