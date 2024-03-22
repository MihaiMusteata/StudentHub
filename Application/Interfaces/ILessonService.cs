using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface ILessonService
{
  Task<IdentityResult> CreateLesson(LessonData lessonData);
  Task<LessonData?> GetLesson(int id);
  Task<List<DocumentMinimal>> GetLessonDocuments(int lessonId);
  Task<IdentityResult> UploadDocumentToLesson(int lessonId, DocumentData documentData);
}