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
    public class LessonController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LessonController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{lessonId}/vocab")]
        public async Task<IActionResult> GetLessonVocab(Guid lessonId)
        {
            try
            {
                var vocabs = await _context.LessonVocabularies
                    .Include(lv => lv.Vocabulary)
                    .Where(lv => lv.LessonId == lessonId)
                    .OrderBy(lv => lv.OrderIndex)
                    .Select(lv => new {
                        id = lv.Vocabulary.Id,
                        word = lv.Vocabulary.Word,
                        meaning = lv.Vocabulary.Meaning,
                        pronunciation = lv.Vocabulary.Pronunciation,
                        example = lv.Vocabulary.ExampleSentence,
                        exampleTranslation = lv.Vocabulary.ExampleTranslation
                    })
                    .ToListAsync();

                // 👉 ĐÃ SỬA: Xóa dòng return NotFound() đi.
                // Nếu mảng rỗng, trả về thẳng mảng rỗng []. React sẽ tự hiểu và in ra "Bài học trống" mà KHÔNG BÁO LỖI ĐỎ.
                return Ok(vocabs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Database: " + ex.Message });
            }
        }
    }
}