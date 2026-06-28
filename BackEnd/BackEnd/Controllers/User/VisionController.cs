using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Collections.Generic;
using System;
using Microsoft.Extensions.Configuration;

namespace BackEnd.Controllers.User
{
    [ApiController]
    [Route("api/user/student/[controller]")]
    public class VisionController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public VisionController(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _configuration = configuration;
        }

        [HttpPost("recognize")]
        public async Task<IActionResult> RecognizeObjectFromImage([FromBody] ImageAnalyzeRequest request)
        {
            if (string.IsNullOrEmpty(request.ImageBase64))
                return Ok(new { english = "Lỗi", vietnamese = "Không có ảnh.", type = "Error" });

            try
            {
                // 👉 Đọc API Key từ file cấu hình (appsettings.json) thay vì gắn cứng
                string geminiApiKey = _configuration["ApiKeys:Gemini"];

                string primaryApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={geminiApiKey}";
                string fallbackApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={geminiApiKey}";

                // 👉 PROMPT MỚI: Ép AI tập trung 100% vào HỒNG TÂM ĐỎ
                string aiPrompt = "You are an English vocabulary expert. I have drawn a RED CIRCLE (target) on the provided image. Your task is to identify the EXACT specific object, material, or body part located strictly UNDER the RED CIRCLE. Do not describe the general image or the person as a whole. Only focus on the exact spot targeted by the red circle. Return a JSON ARRAY with 1 to 3 related vocabulary words about that specific item (e.g., if the red circle is on a finger, return 'Finger', 'Hand'. If on a shirt collar, return 'Collar', 'Shirt'). Each item must have: 'english', 'vietnamese', 'phonetic', 'type', and 'level' (CEFR). Return NO MARKDOWN.";

                var payload = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new object[]
                            {
                                new { text = aiPrompt },
                                new { inlineData = new { mimeType = "image/jpeg", data = request.ImageBase64 } }
                            }
                        }
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(primaryApiUrl, content);

                if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable)
                {
                    response = await _httpClient.PostAsync(fallbackApiUrl, content);
                }

                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return Ok(new List<object> { new { english = "Lỗi Server", vietnamese = responseString, type = "Error", level = "❌" } });
                }

                using JsonDocument doc = JsonDocument.Parse(responseString);
                var root = doc.RootElement;

                if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                {
                    return Ok(new List<object> { new { english = "Bị chặn", vietnamese = "Không có kết quả.", type = "Error" } });
                }

                var candidate = candidates[0];
                if (!candidate.TryGetProperty("content", out var contentProp))
                {
                    return Ok(new List<object> { new { english = "Safety Block", vietnamese = "Google từ chối quét.", type = "Warning", level = "⚠️" } });
                }

                var aiMessage = contentProp.GetProperty("parts")[0].GetProperty("text").GetString();

                if (aiMessage != null)
                {
                    aiMessage = aiMessage.Replace("```json", "").Replace("```", "").Trim();
                }

                try
                {
                    var finalResult = JsonSerializer.Deserialize<List<object>>(aiMessage ?? "[]");
                    return Ok(finalResult);
                }
                catch
                {
                    return Ok(new List<object> { new { english = "Lỗi JSON", vietnamese = aiMessage, type = "Error" } });
                }
            }
            catch (Exception ex)
            {
                return Ok(new List<object> { new { english = "Lỗi C#", vietnamese = ex.Message, type = "Error", level = "❌" } });
            }
        }
    }

    public class ImageAnalyzeRequest
    {
        public string ImageBase64 { get; set; } = string.Empty;
    }
}