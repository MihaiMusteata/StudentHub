using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IDocumentsService
{
  Task<IdentityResult> CreateDocument(DocumentData documentData);
}