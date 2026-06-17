using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.Services;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình kết nối SQL Server của bạn
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký các lớp nghiệp vụ xử lý vào hệ thống tuần hoàn
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<LearningService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();
app.Run();