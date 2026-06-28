using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BackEnd.Controllers.ContentManager
{
    [Authorize]
    [ApiController]
    [Route("api/cm/[controller]")]
    public class CMController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CMController(AppDbContext context) { _context = context; }

        // Bóc ID người dùng từ Token
        private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value);

        // HÀM HỖ TRỢ: GHI LOG
        private async Task LogAction(Guid userId, string action, string type, string name, string details)
        {
            _context.Database.ExecuteSqlRaw(
                "INSERT INTO CONTENT_LOGS (UserId, Action, EntityType, EntityName, Details) VALUES ({0}, {1}, {2}, {3}, {4})",
                userId, action, type, name, details);
        }

        // ==========================================
        // 1. QUẢN LÝ CHƯƠNG (PHÂN VÙNG NGÔN NGỮ)
        // ==========================================
        [HttpGet("units")]
        public async Task<IActionResult> GetUnits()
        {
            var userId = GetUserId();
            var currentUser = await _context.Users.FindAsync(userId);

            // Nếu là CM quản lý 'en', chỉ lấy Unit có LanguageCode = 'en'
            var query = _context.Units.AsQueryable();
            if (currentUser.ManagedLanguage != "all" && !string.IsNullOrEmpty(currentUser.ManagedLanguage))
            {
                query = query.Where(u => u.LanguageCode == currentUser.ManagedLanguage);
            }

            var units = await query.OrderBy(u => u.OrderIndex).ToListAsync();
            return Ok(units);
        }

        // ==========================================
        // 2. BÀI HỌC (CÓ TRẠNG THÁI DUYỆT & KHÓA EDIT)
        // ==========================================
        [HttpGet("units/{unitId}/lessons")]
        public async Task<IActionResult> GetLessonsByUnit(Guid unitId)
        {
            // Trả về thêm ApprovalStatus và thông tin Khóa
            var lessons = await _context.Lessons
                .Where(l => l.UnitId == unitId)
                .OrderBy(l => l.OrderIndex)
                .Select(l => new {
                    l.Id,
                    l.Title,
                    l.LessonType,
                    ApprovalStatus = EF.Property<string>(l, "ApprovalStatus"),
                    LockedById = EF.Property<Guid?>(l, "LockedById"),
                    IsLocked = EF.Property<DateTime?>(l, "LockedUntil") > DateTime.UtcNow
                }).ToListAsync();
            return Ok(lessons);
        }

        [HttpPost("create-lesson")]
        public async Task<IActionResult> CreateLesson([FromBody] CreateLessonReq req)
        {
            var userId = GetUserId();
            var lesson = new Lesson
            {
                Id = Guid.NewGuid(),
                UnitId = req.UnitId,
                Title = req.Title,
                LessonType = req.LessonType,
                XpReward = 50
            };

            // Ép trạng thái thành Pending bằng Raw SQL (vì EF Model cũ của bạn có thể chưa update)
            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            await _context.Database.ExecuteSqlRawAsync("UPDATE LESSONS SET ApprovalStatus = 'Pending' WHERE Id = {0}", lesson.Id);
            await LogAction(userId, "CREATE", "LESSON", lesson.Title, "Tạo bài học mới (Chờ duyệt)");

            return Ok(new { message = "Tạo Bài học thành công! Đang chờ Admin duyệt.", lesson });
        }

        // API KHÓA BÀI HỌC (Để CM khác không sửa được)
        [HttpPost("lessons/{lessonId}/lock")]
        public async Task<IActionResult> LockLesson(Guid lessonId)
        {
            var userId = GetUserId();
            var lessonLockedBy = await _context.Lessons.Where(l => l.Id == lessonId).Select(l => new {
                LockedBy = EF.Property<Guid?>(l, "LockedById"),
                LockedUntil = EF.Property<DateTime?>(l, "LockedUntil")
            }).FirstOrDefaultAsync();

            if (lessonLockedBy.LockedBy != null && lessonLockedBy.LockedBy != userId && lessonLockedBy.LockedUntil > DateTime.UtcNow)
                return BadRequest(new { message = "Bài học này đang được CM khác chỉnh sửa!" });

            // Khóa trong 30 phút
            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE LESSONS SET LockedById = {0}, LockedUntil = {1} WHERE Id = {2}",
                userId, DateTime.UtcNow.AddMinutes(30), lessonId);

            return Ok(new { message = "Đã khóa bài học để bạn chỉnh sửa." });
        }

        // ==========================================
        // 3. TỪ VỰNG (GHI LOG KHI THÊM)
        // ==========================================
        [HttpPost("lessons/{lessonId}/vocabs")]
        public async Task<IActionResult> AddVocabToLesson(Guid lessonId, [FromBody] VocabReq req)
        {
            var userId = GetUserId();

            // Kiểm tra xem bài học có bị CM khác khóa không
            var isLockedByOther = await _context.Lessons.AnyAsync(l => l.Id == lessonId && EF.Property<Guid?>(l, "LockedById") != userId && EF.Property<DateTime?>(l, "LockedUntil") > DateTime.UtcNow);
            if (isLockedByOther) return BadRequest(new { message = "Bạn không có quyền sửa. Bài học đang bị khóa bởi CM khác!" });

            var vocab = new Vocabulary
            {
                Id = Guid.NewGuid(),
                LanguageCode = req.LanguageCode ?? "en",
                Word = req.Word,
                Meaning = req.Meaning,
                Pronunciation = req.Pronunciation,
                ExampleSentence = req.ExampleSentence,
                ExampleTranslation = req.ExampleTranslation
            };
            _context.Vocabularies.Add(vocab);

            var link = new LessonVocabulary { Id = Guid.NewGuid(), LessonId = lessonId, VocabId = vocab.Id, OrderIndex = 0 };
            _context.LessonVocabularies.Add(link);

            // Khi sửa nội dung, tự động gỡ Approved đưa về Pending để Admin duyệt lại
            await _context.Database.ExecuteSqlRawAsync("UPDATE LESSONS SET ApprovalStatus = 'Pending' WHERE Id = {0}", lessonId);
            await LogAction(userId, "ADD", "VOCAB", vocab.Word, $"Thêm từ vựng vào bài học ID: {lessonId}");

            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm từ vựng thành công! Bài học đã chuyển về trạng thái Chờ duyệt.", vocab });
        }

        [HttpGet("lessons/{lessonId}/vocabs")]
        public async Task<IActionResult> GetVocabsByLesson(Guid lessonId)
        {
            var vocabs = await _context.LessonVocabularies.Include(lv => lv.Vocabulary).Where(lv => lv.LessonId == lessonId).OrderBy(lv => lv.OrderIndex).Select(lv => lv.Vocabulary).ToListAsync();
            return Ok(vocabs);
        }

        // ==========================================
        // API BỔ SUNG: SỬA VÀ XÓA TỪ VỰNG
        // ==========================================
        [HttpPut("lessons/{lessonId}/vocabs/{vocabId}")]
        public async Task<IActionResult> UpdateVocab(Guid lessonId, Guid vocabId, [FromBody] VocabReq req)
        {
            var userId = GetUserId();
            var isLockedByOther = await _context.Lessons.AnyAsync(l => l.Id == lessonId && EF.Property<Guid?>(l, "LockedById") != userId && EF.Property<DateTime?>(l, "LockedUntil") > DateTime.UtcNow);
            if (isLockedByOther) return BadRequest(new { message = "Bài học đang bị khóa bởi CM khác!" });

            var vocab = await _context.Vocabularies.FindAsync(vocabId);
            if (vocab == null) return NotFound(new { message = "Không tìm thấy từ vựng!" });

            // Cập nhật dữ liệu
            vocab.Word = req.Word;
            vocab.Meaning = req.Meaning;
            vocab.Pronunciation = req.Pronunciation;
            vocab.ExampleSentence = req.ExampleSentence;
            vocab.ExampleTranslation = req.ExampleTranslation;

            // Đẩy bài học về trạng thái Chờ duyệt
            await _context.Database.ExecuteSqlRawAsync("UPDATE LESSONS SET ApprovalStatus = 'Pending' WHERE Id = {0}", lessonId);
            await LogAction(userId, "UPDATE", "VOCAB", vocab.Word, $"Sửa từ vựng trong bài học ID: {lessonId}");

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật từ vựng thành công!" });
        }

        [HttpDelete("lessons/{lessonId}/vocabs/{vocabId}")]
        public async Task<IActionResult> DeleteVocab(Guid lessonId, Guid vocabId)
        {
            var userId = GetUserId();
            var isLockedByOther = await _context.Lessons.AnyAsync(l => l.Id == lessonId && EF.Property<Guid?>(l, "LockedById") != userId && EF.Property<DateTime?>(l, "LockedUntil") > DateTime.UtcNow);
            if (isLockedByOther) return BadRequest(new { message = "Bài học đang bị khóa bởi CM khác!" });

            var link = await _context.LessonVocabularies.FirstOrDefaultAsync(lv => lv.LessonId == lessonId && lv.VocabId == vocabId);
            if (link != null)
            {
                _context.LessonVocabularies.Remove(link);
                // Đẩy bài học về trạng thái Chờ duyệt
                await _context.Database.ExecuteSqlRawAsync("UPDATE LESSONS SET ApprovalStatus = 'Pending' WHERE Id = {0}", lessonId);
                await LogAction(userId, "DELETE", "VOCAB", vocabId.ToString(), $"Xóa từ vựng khỏi bài học ID: {lessonId}");
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Đã xóa từ vựng khỏi bài học!" });
        }
        // API HỦY KHÓA BÀI HỌC (Nhả khóa nếu CM đổi ý không sửa nữa)
        [HttpPost("lessons/{lessonId}/unlock")]
        public async Task<IActionResult> UnlockLesson(Guid lessonId)
        {
            var userId = GetUserId();
            var lesson = await _context.Lessons.FindAsync(lessonId);

            if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học!" });

            // Chỉ người đang giữ chìa khóa mới được phép nhả khóa
            if (lesson.LockedById == userId)
            {
                lesson.LockedById = null;
                lesson.LockedUntil = null;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Đã hủy phiên chỉnh sửa và nhả khóa an toàn!" });
        }
        // ==========================================
        // API BỔ SUNG: THÊM CHƯƠNG (UNIT) & XÓA BÀI HỌC (LESSON)
        // ==========================================

        [HttpPost("units")]
        public async Task<IActionResult> CreateUnit([FromBody] CreateUnitReq req)
        {
            var userId = GetUserId();
            var currentUser = await _context.Users.FindAsync(userId);

            // Nếu là Admin hoặc Trưởng phòng ('all'), cho phép tự chọn ngôn ngữ. Nếu là CM thường, lấy đúng ngôn ngữ họ quản lý.
            string lang = currentUser!.ManagedLanguage == "all" ? (req.LanguageCode ?? "en") : currentUser.ManagedLanguage!;

            var unit = new Unit
            {
                Id = Guid.NewGuid(),
                Title = req.Title,
                LanguageCode = lang,
                ColorHex = req.ColorHex ?? "#7c3aed",
                OrderIndex = await _context.Units.CountAsync() + 1
            };

            _context.Units.Add(unit);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm chương mới thành công!", unit });
        }

        [HttpDelete("lessons/{lessonId}")]
        public async Task<IActionResult> DeleteLesson(Guid lessonId)
        {
            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học!" });

            // 1. Xóa toàn bộ từ vựng nằm trong bài học này trước (Tránh lỗi khóa ngoại Foreign Key)
            var lessonVocabs = _context.LessonVocabularies.Where(lv => lv.LessonId == lessonId);
            _context.LessonVocabularies.RemoveRange(lessonVocabs);

            // 2. Tiến hành xóa bài học
            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa bài học thành công!" });
        }
        // ==========================================
        // API: GỬI DUYỆT LẠI BÀI HỌC
        // ==========================================
        [HttpPost("lessons/{lessonId}/submit-for-review")]
        public async Task<IActionResult> SubmitForReview(Guid lessonId)
        {
            var userId = GetUserId();
            var lesson = await _context.Lessons.FindAsync(lessonId);

            if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học!" });

            // Kiểm tra xem bài học có đang bị Biên tập viên khác khóa không
            if (lesson.LockedById != null && lesson.LockedById != userId && lesson.LockedUntil > DateTime.UtcNow)
                return BadRequest(new { message = "Bài học đang bị Biên tập viên khác khóa, không thể gửi duyệt!" });

            // Chuyển trạng thái về Chờ duyệt và Tự động nhả khóa để an toàn
            lesson.ApprovalStatus = "Pending";
            lesson.LockedById = null;
            lesson.LockedUntil = null;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã gửi lại bài học cho Admin xét duyệt!" });
        }
        // ==========================================
        // API BỔ SUNG: THỐNG KÊ CHẤT LƯỢNG NỘI DUNG (DÀNH CHO TRANG BÁO CÁO)
        // ==========================================
        [HttpGet("content-quality")]
        public async Task<IActionResult> GetContentQuality()
        {
            var approved = await _context.Lessons.CountAsync(l => l.ApprovalStatus == "Approved");
            var rejected = await _context.Lessons.CountAsync(l => l.ApprovalStatus == "Rejected");
            var pending = await _context.Lessons.CountAsync(l => l.ApprovalStatus == "Pending");
            var total = approved + rejected + pending;

            return Ok(new
            {
                Total = total,
                Approved = approved,
                Rejected = rejected,
                Pending = pending
            });
        }
    }
    public class CreateUnitReq { public string Title { get; set; } = ""; public string? LanguageCode { get; set; } public string? ColorHex { get; set; } }
    public class CreateLessonReq { public Guid UnitId { get; set; } public string Title { get; set; } = ""; public string LessonType { get; set; } = "Vocab"; }
    public class VocabReq { public string Word { get; set; } = ""; public string Meaning { get; set; } = ""; public string? Pronunciation { get; set; } public string? ExampleSentence { get; set; } public string? ExampleTranslation { get; set; } public string? LanguageCode { get; set; } }
}