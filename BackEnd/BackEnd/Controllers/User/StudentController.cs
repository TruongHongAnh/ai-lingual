using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BackEnd.Services;
using BackEnd.DTOs;
using BackEnd.Data;
using BackEnd.Models;

namespace BackEnd.Controllers.User
{
    [ApiController]
    [Route("api/user/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly LearningService _learningService;

        public StudentController(AppDbContext context, LearningService learningService)
        {
            _context = context;
            _learningService = learningService;
        }

        [HttpPost("ai-grammar-check")]
        public async Task<IActionResult> CheckGrammar([FromBody] AiGrammarRequest request)
        {
            var result = await _learningService.ExecuteGrammarAnalysisAsync(request);
            return Ok(result);
        }

        [HttpGet("menu-data")]
        public async Task<IActionResult> GetMenuData()
        {
            var activeCourses = await _context.Courses.Where(c => c.IsPublished).Select(c => new { c.Id, c.Title, c.TargetLanguage }).ToListAsync();
            var availableLanguages = activeCourses.Select(c => c.TargetLanguage).Distinct().ToList();
            return Ok(new { courses = activeCourses, languages = availableLanguages });
        }

      
        // =========================================================
        // API MỚI: TÍNH TOÁN LỘ TRÌNH HỌC (LEARNING PATH) ĐỘNG (BẢN BỌC THÉP)
        // =========================================================
        [Authorize]
        [HttpGet("learning-path")]
        public async Task<IActionResult> GetLearningPath([FromQuery] string lang = "en")
        {
            try
            {
                // 1. Quét đa dạng loại Token ID để chống văng lỗi Null
                var userIdClaim = User.FindFirst("Id")?.Value
                               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "Không tìm thấy ID trong Token!" });

                // 2. Kiểm tra an toàn định dạng Guid
                if (!Guid.TryParse(userIdClaim, out Guid userId))
                    return BadRequest(new { message = "Định dạng ID người dùng không hợp lệ!" });

                // 3. Lấy Units
                var units = await _context.Units
                    .Where(u => u.LanguageCode == lang)
                    .OrderBy(u => u.OrderIndex)
                    .ToListAsync();

                if (!units.Any())
                    return Ok(new List<object>()); // Trả về mảng rỗng an toàn

                var unitIds = units.Select(u => u.Id).ToList();

                // 4. Lấy Lessons
                var allLessons = await _context.Lessons
                    .Where(l => unitIds.Contains(l.UnitId))
                    .OrderBy(l => l.OrderIndex)
                    .ToListAsync();

                // 5. Lấy tiến độ
                var completedLessonIds = (await _context.UserProgresses
                    .Where(p => p.UserId == userId && p.Status == "Completed")
                    .Select(p => p.LessonId)
                    .ToListAsync())
                    .ToHashSet();

                // 6. Thuật toán Duolingo
                var lessonStatusMap = new Dictionary<Guid, string>();
                bool foundActive = false;

                foreach (var lesson in allLessons)
                {
                    if (completedLessonIds.Contains(lesson.Id))
                    {
                        lessonStatusMap[lesson.Id] = "completed";
                    }
                    else if (!foundActive)
                    {
                        lessonStatusMap[lesson.Id] = "active";
                        foundActive = true;
                    }
                    else
                    {
                        lessonStatusMap[lesson.Id] = "locked";
                    }
                }

                // 7. Build JSON và ÉP KIỂU ToList() ngay lập tức để chống crash ngầm
                var result = units.Select(u => new {
                    id = u.Id,
                    title = u.Title,
                    desc = u.Description,
                    color = u.ColorHex,
                    lessons = allLessons.Where(l => l.UnitId == u.Id).Select(l => new {
                        id = l.Id,
                        name = l.Title,
                        xp = l.XpReward,
                        status = lessonStatusMap.ContainsKey(l.Id) ? lessonStatusMap[l.Id] : "locked"
                    }).ToList()
                }).ToList(); // <-- CHÌA KHÓA CHỐNG CRASH Ở ĐÂY

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Trả về BadRequest (400) để đảm bảo Axios của React đọc được 100% tin nhắn lỗi
                return BadRequest(new
                {
                    message = "Lỗi CSDL Backend: " + ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        // =========================================================
        // API HOÀN THÀNH BÀI HỌC
        // =========================================================
        [Authorize]
        [HttpPost("complete-lesson")]
        public async Task<IActionResult> CompleteLesson([FromBody] CompleteLessonRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst("Id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "Vui lòng đăng nhập lại!" });

                Guid userId = Guid.Parse(userIdClaim);

                // Kiểm tra lesson tồn tại
                var lesson = await _context.Lessons.FindAsync(request.LessonId);
                if (lesson == null)
                    return NotFound(new { message = "Bài học không tồn tại!" });

                // Kiểm tra đã có progress chưa
                var existingProgress = await _context.UserProgresses
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == request.LessonId);

                if (existingProgress != null)
                {
                    // Cập nhật nếu đã có
                    existingProgress.Status = "Completed";
                    existingProgress.Score = request.Score;
                    existingProgress.CompletedAt = DateTime.UtcNow;
                }
                else
                {
                    // Tạo mới
                    var progress = new UserProgress
                    {
                        UserId = userId,
                        LessonId = request.LessonId,
                        Status = "Completed",
                        Score = request.Score,
                        CompletedAt = DateTime.UtcNow
                    };
                    _context.UserProgresses.Add(progress);
                }

                // Cộng XP cho user
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.TotalXP += lesson.XpReward;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Hoàn thành bài học!", xpEarned = lesson.XpReward, totalXP = user?.TotalXP });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi: " + ex.Message });
            }
        }
    }

    public class CompleteLessonRequest
    {
        public Guid LessonId { get; set; }
        public double Score { get; set; }
    }
}