using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Services;
using BackEnd.Data;
using BackEnd.DTOs;

namespace BackEnd.Controllers.Public
{
    [ApiController]
    [Route("api/public/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly AppDbContext _context;
        
        public AuthController(AuthService authService, AppDbContext context) 
        { 
            _authService = authService;
            _context = context;
        }

        /// <summary>
        /// Đăng nhập bằng email và mật khẩu
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu đầu vào không hợp lệ" });

            var response = await _authService.AuthenticateAsync(request);
            if (response == null)
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác hoặc tài khoản đã bị khóa!" });
            
            return Ok(response);
        }

        /// <summary>
        /// Đăng ký tài khoản mới
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu đầu vào không hợp lệ" });

            var success = await _authService.RegisterAsync(request);
            if (!success)
                return Conflict(new { message = "Email này đã được sử dụng trong hệ thống hoặc dữ liệu không hợp lệ!" });
            
            return Ok(new { message = "Đăng ký tài khoản học viên thành công! Vui lòng đăng nhập." });
        }

        /// <summary>
        /// Quên mật khẩu - gửi email khôi phục
        /// </summary>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Vui lòng nhập email" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound(new { message = "Email này chưa được đăng ký trong hệ thống" });

            // TODO: Implement actual email sending logic
            // For now, simulate success
            return Ok(new { message = "✅ Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn" });
        }
    }
}
