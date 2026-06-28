using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BackEnd.Controllers.User
{
    [Authorize]
    [ApiController]
    [Route("api/user/student/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfileController(AppDbContext context)
        {
            _context = context;
        }

        // Bóc tách ID người dùng từ Token JWT
        private Guid GetUserIdFromToken()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("id")?.Value
                            ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdString))
                throw new Exception("Không tìm thấy ID trong Token. Vui lòng đăng nhập lại!");

            return Guid.Parse(userIdString);
        }

        // 1. API LẤY THÔNG TIN HỒ SƠ
        // 1. API LẤY THÔNG TIN HỒ SƠ
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                Guid userId = GetUserIdFromToken();

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản" });

                return Ok(new
                {
                    fullName = user.FullName ?? "",
                    email = user.Email,
                    phone = user.Phone ?? "",
                    dob = user.Dob?.ToString("yyyy-MM-dd") ?? "",
                    bio = user.Bio ?? "",
                    isPremium = user.IsPremium,
                    // 👉 BỔ SUNG 2 DÒNG NÀY ĐỂ REACT BIẾT QUYỀN VÀ NGÔN NGỮ
                    role = user.Role,
                    managedLanguage = user.ManagedLanguage
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(401, new { message = "Lỗi xác thực: " + ex.Message });
            }
        }

        // 2. API CẬP NHẬT THÔNG TIN VÀ MỤC TIÊU
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
        {
            try
            {
                Guid userId = GetUserIdFromToken();

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản" });

                user.FullName = request.FullName;
                user.Phone = request.Phone;
                user.Bio = request.Bio;

                if (DateTime.TryParse(request.Dob, out DateTime parsedDob))
                {
                    user.Dob = parsedDob;
                }

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Database: " + ex.Message });
            }
        }

        // 3. API ĐỔI MẬT KHẨU
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                Guid userId = GetUserIdFromToken();
                var user = await _context.Users.FindAsync(userId);

                if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản" });

                // Kiểm tra mật khẩu cũ
                if (user.PasswordHash != request.OldPassword)
                {
                    return BadRequest(new { message = "Mật khẩu hiện tại không chính xác!" });
                }

                // Cập nhật mật khẩu mới
                user.PasswordHash = request.NewPassword;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đổi mật khẩu thành công!" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Database: " + ex.Message });
            }
        }
    }

    // CÁC CLASS DTO HỨNG DỮ LIỆU TỪ REACT
    public class ProfileUpdateRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Dob { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}