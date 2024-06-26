using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Api.DataService;
using Api.Hubs;
using Application.Identity;
using Application.Interfaces;
using Application.Services;
using Domain.User;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddDbContext<StudentHubContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddLogging();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IAdminPanelService, AdminPanelService>();
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IStudentsService, StudentsService>();
builder.Services.AddScoped<ITeachersService, TeachersService>();
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<ILessonAssignmentService, LessonAssignmentService>();
builder.Services.AddScoped<ILessonAttendanceService, LessonAttendanceService>();
builder.Services.AddScoped<ISubmissionService, SubmissionService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IGradesService, GradesService>();
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<StudentHubContext>()
    .AddUserValidator<UserValidator>()
    .AddDefaultTokenProviders();
builder.Services.AddScoped<IdentityUserManager>();


builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = long.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 3L * 1024 * 1024 * 1024;
    serverOptions.Limits.MaxRequestBufferSize = 3L * 1024 * 1024 * 1024;
});


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateActor = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        RequireExpirationTime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration.GetValue<string>("Jwt:Issuer"),
        ValidAudience = builder.Configuration.GetValue<string>("Jwt:Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetValue<string>("Jwt:Key")))
    };
    
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["jwt"];
        
            if (!string.IsNullOrEmpty(token))
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

                if (jwtToken.ValidTo > DateTime.UtcNow)
                {
                    context.Token = token;
                }
                else
                {
                    context.Fail("Token has expired");
                }
            }

            return Task.CompletedTask;
        }
        };
});

var provider = builder.Services.BuildServiceProvider();
var configuration = provider.GetRequiredService<IConfiguration>();

builder.Services.AddCors(options =>
{
    var frontendUrl = configuration.GetValue<string>("FrontendURL");

    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins(frontendUrl)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddSingleton<SharedDb>();

var directoryName = configuration.GetValue<string>("UploadsFolder");
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), directoryName);
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/Chat");

app.Run();