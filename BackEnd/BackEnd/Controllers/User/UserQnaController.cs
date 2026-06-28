using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using System.Security.Claims;
using BackEnd.Models;

namespace BackEnd.Controllers.User
{
    [ApiController]
    [Route("api/user/[controller]")]
    public class UserQnaController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UserQnaController(AppDbContext context) { _context = context; }

        // Hàm lấy ID của học viên đang đăng nhập (Từ JWT Token)
        private Guid GetUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            // Nếu không có token (đang test), tự động lấy ID của "Nguyễn Văn Hải" để không bị lỗi
            return userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Parse("30000000-0000-0000-0000-000000000001");
        }

        // ==========================================
        // 1. HỌC VIÊN GỬI CÂU HỎI / BÁO LỖI
        // ==========================================
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuestion([FromBody] SubmitQnaReq req)
        {
            var userId = GetUserId();

            // Kiểm tra xem bài học có tồn tại không
            var lessonExists = await _context.Lessons.AnyAsync(l => l.Id == req.LessonId);
            if (!lessonExists) return NotFound(new { message = "Không tìm thấy bài học!" });

            var qna = new LessonQna // Tên Entity Model của bạn có thể là LessonQna
            {
                Id = Guid.NewGuid(),
                LessonId = req.LessonId,
                StudentId = userId,
                Question = req.Question,
                Status = "Pending", // Trạng thái đang chờ CM trả lời
                CreatedAt = DateTime.UtcNow
            };

            _context.LessonQnas.Add(qna);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã gửi câu hỏi thành công! Biên tập viên sẽ phản hồi sớm nhất." });
        }

        // ==========================================
        // 2. LẤY LỊCH SỬ CÂU HỎI CỦA HỌC VIÊN TRONG BÀI NÀY
        // ==========================================
        [HttpGet("my-questions/{lessonId}")]
        public async Task<IActionResult> GetMyQuestionsInLesson(Guid lessonId)
        {
            var userId = GetUserId();
            var qnas = await _context.LessonQnas
                .Where(q => q.LessonId == lessonId && q.StudentId == userId)
                .OrderByDescending(q => q.CreatedAt)
                .Select(q => new {
                    q.Id,
                    q.Question,
                    q.Answer,
                    q.Status,
                    CreatedAt = q.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                })
                .ToListAsync();

            return Ok(qnas);
        }
    }

    public class SubmitQnaReq
    {
        public Guid LessonId { get; set; }
        public string Question { get; set; } = "";
    }
}