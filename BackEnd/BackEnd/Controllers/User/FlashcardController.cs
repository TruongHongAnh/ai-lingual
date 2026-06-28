using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using System.Linq;
using System;

namespace BackEnd.Controllers.User
{
    [ApiController]
    [Route("api/user/student/[controller]")]
    public class FlashcardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FlashcardController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/user/student/flashcard
        [HttpGet]
        public async Task<IActionResult> GetMyFlashcards()
        {
            try
            {
                // Tạm thời fix cứng ID của tài khoản VIP mà chúng ta đã seed data hôm trước
                // (Sau này bạn ghép Token JWT vào thì thay bằng ID của User đang đăng nhập nhé)
                var userId = Guid.Parse("30000000-0000-0000-0000-000000000001");

                var flashcards = await _context.UserFlashcards
                    .Where(f => f.UserId == userId)
                    .OrderBy(f => f.NextReviewDate) // Từ nào cần ôn gấp xếp lên đầu
                    .Select(f => new {
                        id = f.Id,
                        targetWord = f.TargetWord,
                        translation = f.Translation,
                        nextReviewDate = f.NextReviewDate,
                        intervalDays = f.IntervalDays,
                        // Nếu NextReviewDate nhỏ hơn thời gian hiện tại -> Cần ôn ngay
                        isDue = f.NextReviewDate <= DateTime.UtcNow
                    })
                    .ToListAsync();

                return Ok(flashcards);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Database: " + ex.Message });
            }
        }
    }
}