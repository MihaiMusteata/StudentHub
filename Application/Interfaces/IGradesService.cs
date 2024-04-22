using Application.Contract;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces;

public interface IGradesService
{
  Task<IdentityResult> GradeStudent(GradeInfo grade);
}