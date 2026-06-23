using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;

namespace BackEnd.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context) { _context = context; }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Role,
                    u.IsBanned,
                    u.BanReason,
                    u.TotalXP
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPut("ban-violator")]
        public async Task<IActionResult> BanUser([FromBody] BanUserRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng vi phạm!" });

            user.IsBanned = true;
            user.BanReason = request.Reason;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Tài khoản {user.Email} đã bị khóa vĩnh viễn trên toàn hệ thống!" });
        }

        [HttpPut("resolve-support-ticket")]
        public async Task<IActionResult> ResolveTicket([FromBody] TicketResolveRequest request)
        {
            var ticket = await _context.SupportTickets.FindAsync(request.TicketId);
            if (ticket == null) return NotFound(new { message = "Phiếu khiếu nại tài khoản không tồn tại!" });

            ticket.ResolverId = request.AdminId;
            ticket.AdminReply = request.Reply;
            ticket.Status = "Resolved";
            ticket.ResolvedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xử lý xong khiếu nại và phản hồi lại cho khách hàng!" });
        }

        [HttpPut("unban-user")]
        public async Task<IActionResult> UnbanUser([FromBody] UnbanUserRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound(new { message = "Tài khoản không tồn tại!" });

            user.IsBanned = false;
            user.BanReason = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Tài khoản {user.Email} đã được mở khóa!" });
        }

        // ==================================================
        // API CHO TRANG XÉT DUYỆT GIÁO TRÌNH ĐƯỢC ĐẶT ĐÚNG CHỖ
        // ==================================================
        [HttpGet("pending-lessons")]
        public async Task<IActionResult> GetPendingLessons()
        {
            var lessons = await _context.Lessons
                .Include(l => l.Unit) // Join bảng Unit để lấy tên chương
                .Where(l => l.ApprovalStatus == "Pending")
                .Select(l => new {
                    id = l.Id,
                    unitName = l.Unit.Title,
                    lessonName = l.Title,
                    cmName = "Biên tập viên",
                    submitTime = "Vừa xong"
                })
                .ToListAsync();
            return Ok(lessons);
        }

        [HttpPut("approve-lesson")]
        public async Task<IActionResult> ApproveLesson([FromBody] ApproveLessonRequest request)
        {
            var lesson = await _context.Lessons.FindAsync(request.LessonId);
            if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học!" });

            lesson.ApprovalStatus = "Approved";
            lesson.LockedById = null;
            lesson.LockedUntil = null;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt bài học thành công lên hệ thống!" });
        }
        // ==================================================
        // API BỔ SUNG: TỪ CHỐI VÀ XEM TRƯỚC BÀI HỌC
        // ==================================================
        [HttpPut("reject-lesson")]
        public async Task<IActionResult> RejectLesson([FromBody] ApproveLessonRequest request)
        {
            var lesson = await _context.Lessons.FindAsync(request.LessonId);
            if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học!" });

            lesson.ApprovalStatus = "Rejected";
            // Mở khóa để CM có thể vào sửa lại
            lesson.LockedById = null;
            lesson.LockedUntil = null;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối! Bài học đã được gửi trả lại cho Biên tập viên." });
        }

        [HttpGet("lesson-preview/{lessonId}")]
        public async Task<IActionResult> GetLessonPreview(Guid lessonId)
        {
            var vocabs = await _context.LessonVocabularies
                .Include(lv => lv.Vocabulary)
                .Where(lv => lv.LessonId == lessonId)
                .OrderBy(lv => lv.OrderIndex)
                .Select(lv => new {
                    word = lv.Vocabulary!.Word,
                    meaning = lv.Vocabulary.Meaning,
                    pronunciation = lv.Vocabulary.Pronunciation,
                    exampleSentence = lv.Vocabulary.ExampleSentence,
                    exampleTranslation = lv.Vocabulary.ExampleTranslation
                })
                .ToListAsync();

            return Ok(vocabs);
        }
    } // 👉 DẤU NGOẶC ĐÓNG CỦA CLASS ADMINCONTROLLER Ở ĐÂY

    // CÁC CLASS DTO PHẢI NẰM NGOÀI CLASS CONTROLLER NHƯNG VẪN TRONG NAMESPACE
    public class UnbanUserRequest
    {
        public Guid UserId { get; set; }
    }

    public class ApproveLessonRequest
    {
        public Guid LessonId { get; set; }
    }
}