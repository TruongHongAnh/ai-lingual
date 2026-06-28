using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
<<<<<<< HEAD
using System.Collections.Generic;
=======
>>>>>>> 804aeb07854dcd2965ad844eb9a90ec455c596b4

namespace BackEnd.Controllers.ContentManager
{
    [ApiController]
    [Route("api/cm/[controller]")]
    public class QnaController : ControllerBase
    {
        private readonly AppDbContext _context;
        public QnaController(AppDbContext context) { _context = context; }

<<<<<<< HEAD
        // ==========================================
        // 1. LẤY DANH SÁCH CÂU HỎI THỰC TẾ
        // ==========================================
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingQna()
        {
            var qnas = await _context.LessonQnas
                .Include(q => q.Lesson).ThenInclude(l => l.Unit) // Join để lấy tên Bài học và Tên Chương
                .Include(q => q.Student)                         // Join để lấy thông tin Học viên
                .Where(q => q.Status == "Unanswered" || q.Status == "Pending")
                .OrderByDescending(q => q.CreatedAt)
                .Select(q => new {
                    id = q.Id,
                    lessonTitle = q.Lesson!.Title,
                    unitTitle = q.Lesson.Unit!.Title,
                    studentName = q.Student!.FullName,
                    studentEmail = q.Student.Email,
                    studentXp = q.Student.TotalXP,
                    studentIsBanned = q.Student.IsBanned,
                    question = q.Question,
                    answer = q.Answer,
                    status = q.Status,
                    createdAt = q.CreatedAt, // Trong DB bạn là DateTime (không null)
                    issueType = (q.Question.ToLower().Contains("lỗi") || q.Question.ToLower().Contains("sai")) ? "Bug" : "Grammar"
                })
                .ToListAsync();

            // Format lại định dạng ngày giờ cho đẹp (Gỡ bỏ hoàn toàn .HasValue và .Value)
            var result = qnas.Select(q => new {
                q.id,
                q.lessonTitle,
                q.unitTitle,
                q.studentName,
                q.studentEmail,
                q.studentXp,
                q.studentIsBanned,
                q.question,
                q.answer,
                q.status,
                q.issueType,
                createdAt = q.createdAt.ToString("dd/MM/yyyy HH:mm")
            });

            return Ok(result);
        }

        // ==========================================
        // 2. LẤY THỐNG KÊ BIỂU ĐỒ TRONG 7 NGÀY QUA
        // ==========================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetQnaStats()
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-6).Date;

            // Nhóm theo ngày từ Database (Gỡ bỏ .Value.Date, chỉ dùng .Date)
            var rawData = await _context.LessonQnas
                .Where(q => q.CreatedAt >= sevenDaysAgo)
                .GroupBy(q => q.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            var stats = new List<object>();
            string[] daysOfWeek = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };

            // Sinh dữ liệu cho đủ 7 ngày
            for (int i = 0; i < 7; i++)
            {
                var d = sevenDaysAgo.AddDays(i);
                var match = rawData.FirstOrDefault(x => x.Date == d);
                stats.Add(new
                {
                    day = daysOfWeek[(int)d.DayOfWeek],
                    count = match?.Count ?? 0
                });
            }

            return Ok(stats);
        }

        // ==========================================
        // 3. GHI NHẬN CÂU TRẢ LỜI VÀO DATABASE
        // ==========================================
        [HttpPut("reply")]
        public async Task<IActionResult> ReplyQna([FromBody] ReplyQnaReq req)
        {
            var qna = await _context.LessonQnas.FindAsync(req.QnaId);
            if (qna == null) return NotFound(new { message = "Không tìm thấy câu hỏi!" });

            qna.ManagerId = req.ManagerId;
            qna.Answer = req.AnswerText;
            qna.Status = "Answered"; // Đóng Ticket

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã lưu phản hồi vào Database thành công!" });
        }
    }

    public class ReplyQnaReq
    {
        public Guid QnaId { get; set; }
        public Guid ManagerId { get; set; }
        public string AnswerText { get; set; }
    }
}
=======
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var qnas = await _context.LessonQnas
                .Where(q => q.Status == "Unanswered")
                .Select(q => new
                {
                    q.Id,
                    LessonTitle = q.Lesson!.Title,
                    StudentName = q.Student!.FullName,
                    q.Question,
                    q.Answer,
                    q.Status
                })
                .ToListAsync();
            return Ok(qnas);
        }

        [HttpPut("reply")]
        public async Task<IActionResult> Reply([FromBody] ReplyQnaRequest request)
        {
            var qna = await _context.LessonQnas.FindAsync(request.QnaId);
            if (qna == null)
                return NotFound(new { message = "Câu hỏi không tồn tại!" });

            qna.ManagerId = request.ManagerId;
            qna.Answer = request.AnswerText;
            qna.Status = "Answered";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã trả lời câu hỏi!" });
        }
    }

    public class ReplyQnaRequest
    {
        public Guid QnaId { get; set; }
        public Guid ManagerId { get; set; }
        public string AnswerText { get; set; } = "";
    }
}
>>>>>>> 804aeb07854dcd2965ad844eb9a90ec455c596b4
