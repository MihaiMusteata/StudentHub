using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IDocumentsService
{
  Task<IdentityResult> CreateDocument(DocumentData documentData);
  Task<DocumentData?> GetDocument(int id);
  Task<List<DocumentMinimal>> GetDocuments();
  Task<IdentityResult> DeleteDocument(int id);
}