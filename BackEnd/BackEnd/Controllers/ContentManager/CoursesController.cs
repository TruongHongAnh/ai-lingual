using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.Models;

namespace BackEnd.Controllers.ContentManager
{
    [ApiController]
    [Route("api/cm/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CoursesController(AppDbContext context) { _context = context; }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var courses = await _context.Courses
                .Select(c => new { c.Id, c.Title, c.TargetLanguage })
                .ToListAsync();
            return Ok(courses);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
        {
            var course = new Course
            {
                Title = request.Title,
                TargetLanguage = request.TargetLanguage ?? "en",
                IsPublished = false
            };
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Khóa học đã được tạo thành công!", courseId = course.Id });
        }
    }

    public class CreateCourseRequest
    {
        public string Title { get; set; } = "";
        public string? TargetLanguage { get; set; }
    }
}
