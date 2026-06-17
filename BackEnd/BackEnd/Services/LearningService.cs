using System;
using System.Threading.Tasks;
using BackEnd.Data;
using BackEnd.Models;
using BackEnd.DTOs;

namespace BackEnd.Services
{
    public class LearningService
    {
        private readonly AppDbContext _context;

        public LearningService(AppDbContext context) { _context = context; }

        public async Task<AiGrammarResponse> ExecuteGrammarAnalysisAsync(AiGrammarRequest request)
        {
            // Mô phỏng lõi AI phân tích cấu trúc câu tiếng Anh
            string corrected = request.Text;
            string explanation = "Cấu trúc ngữ pháp chuẩn xác, không phát hiện lỗi sai.";

            if (request.Text.ToLower().Contains("i eat a apple"))
            {
                corrected = "I ate an apple yesterday.";
                explanation = "Từ 'eat' chuyển thành quá khứ 'ate' do ngữ cảnh. Sử dụng mạo từ 'an' trước nguyên âm 'a'.";
            }

            // Ghi nhận đo lường chi phí lưu vết Token API vào hệ thống
            var log = new AiUsageLog
            {
                UserId = request.UserId,
                Feature = "Grammar_Check",
                PromptTokens = request.Text.Length / 4 + 1,
                CompletionTokens = (corrected.Length + explanation.Length) / 4 + 1
            };

            _context.AiUsageLogs.Add(log);
            await _context.SaveChangesAsync();

            return new AiGrammarResponse { Original = request.Text, Corrected = corrected, Explanation = explanation };
        }
    }
}