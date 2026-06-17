using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Services;
using BackEnd.DTOs;

namespace BackEnd.Controllers.User
{
    [ApiController]
    [Route("api/user/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly LearningService _learningService;
        public StudentController(LearningService learningService) { _learningService = learningService; }

        [HttpPost("ai-grammar-check")]
        public async Task<IActionResult> CheckGrammar([FromBody] AiGrammarRequest request)
        {
            var result = await _learningService.ExecuteGrammarAnalysisAsync(request);
            return Ok(result);
        }
    }
}