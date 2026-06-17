using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Services;
using BackEnd.DTOs;

namespace BackEnd.Controllers.Public
{
    [ApiController]
    [Route("api/public/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        public AuthController(AuthService authService) { _authService = authService; }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.AuthenticateAsync(request);
            if (response == null) return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không chính xác hoặc đã bị khóa!" });
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var success = await _authService.RegisterAsync(request);
            if (!success) return BadRequest(new { message = "Email này đã được sử dụng trong hệ thống!" });
            return Ok(new { message = "Đăng ký tài khoản học viên thành công!" });
        }
    }
}