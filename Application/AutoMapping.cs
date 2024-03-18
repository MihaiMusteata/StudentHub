using Application.Contract;
using AutoMapper;
using Domain.UniversityTables;

namespace Application;

public class AutoMapping : Profile
{
    public AutoMapping()
    {
        CreateMap<StudentDbTable, Student>()
            .ForMember(dest => dest.UniversityId, opt
                => opt.MapFrom(src => src.University.Id))
            .ForMember(dest => dest.FacultyId, opt
                => opt.MapFrom(src => src.Faculty.Id))
            .ForMember(dest => dest.SpecialtyId, opt
                => opt.MapFrom(src => src.Specialty.Id))
            .ForMember(dest => dest.DepartmentId, opt
                => opt.MapFrom(src => src.Department.Id))
            .ForMember(dest => dest.FirstName, opt
                => opt.MapFrom(src => src.User.FirstName))
            .ForMember(dest => dest.LastName, opt
                => opt.MapFrom(src => src.User.LastName))
            .ForMember(dest => dest.BirthDate, opt
                => opt.MapFrom(src => src.User.BirthDate))
            .ForMember(dest => dest.GroupId, opt 
                => opt.MapFrom(src => src.Group.Id));

        CreateMap<Student, StudentDbTable>()
            .ForMember(dest => dest.UserId, opt
                => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.Year, opt
                => opt.MapFrom(src => src.Year))
            .ForMember(dest => dest.DepartmentId, opt
                => opt.MapFrom(src => src.DepartmentId))
            .ForMember(dest => dest.EnrollmentNumber, opt
                => opt.MapFrom(src => src.EnrollmentNumber))
            .ForMember(dest => dest.DegreeType, opt
                => opt.MapFrom(src => src.DegreeType))
            .ForMember(dest => dest.FinanceType, opt
                => opt.MapFrom(src => src.FinanceType))
            .ForMember(dest => dest.FacultyId, opt
                => opt.MapFrom(src => src.FacultyId))
            .ForMember(dest => dest.UniversityId, opt
                => opt.MapFrom(src => src.UniversityId))
            .ForMember(dest => dest.GroupId, opt
                => opt.MapFrom(src => src.GroupId))
            .ForMember(dest => dest.StudyFrequency, opt
                => opt.MapFrom(src => src.StudyFrequency))
            .ForMember(dest => dest.SpecialtyId, opt
                => opt.MapFrom(src => src.SpecialtyId))
            .ForMember(dest => dest.ScholarshipType, opt
                => opt.MapFrom(src => src.ScholarshipType))
            .ForMember(dest => dest.EnrollmentDate, opt
                => opt.MapFrom(src => src.EnrollmentDate))
            .ForMember(dest => dest.GraduationDate, opt
                => opt.MapFrom(src => src.GraduationDate));
        
        CreateMap<TeacherDbTable, Teacher>()
            .ForMember(dest => dest.UniversityId, opt
                => opt.MapFrom(src => src.University.Id))
            .ForMember(dest => dest.FirstName, opt
                => opt.MapFrom(src => src.User.FirstName))
            .ForMember(dest => dest.LastName, opt
                => opt.MapFrom(src => src.User.LastName))
            .ForMember(dest => dest.BirthDate, opt
                => opt.MapFrom(src => src.User.BirthDate));
        
        CreateMap<Teacher, TeacherDbTable>()
            .ForMember(dest => dest.UserId, opt
                => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.UniversityId, opt
                => opt.MapFrom(src => src.UniversityId));
        
    }
}