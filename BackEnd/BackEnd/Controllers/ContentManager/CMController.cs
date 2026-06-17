using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Data;
using BackEnd.Models;
using BackEnd.DTOs;

namespace BackEnd.Controllers.ContentManager
{
    [ApiController]
    [Route("api/cm/[controller]")]
    public class CMController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CMController(AppDbContext context) { _context = context; }

        [HttpPost("create-lesson")]
        public async Task<IActionResult> CreateLesson([FromBody] CreateLessonRequest request)
        {
            var lesson = new Lesson { UnitId = request.UnitId, Title = request.Title, LessonType = request.LessonType };
            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Biên tập viên tạo bài học mới thành công!", lessonId = lesson.Id });
        }

        [HttpPut("reply-student-qna")]
        public async Task<IActionResult> ReplyQna([FromBody] ReplyQnaRequest request)
        {
            var qna = await _context.LessonQnas.FindAsync(request.QnaId);
            if (qna == null) return NotFound(new { message = "Không tìm thấy câu hỏi của học viên" });

            qna.ManagerId = request.ManagerId;
            qna.Answer = request.AnswerText;
            qna.Status = "Answered";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã gửi câu trả lời giải thích ngữ pháp thành công!" });
        }
    }
}