using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using BackEnd.Data;
using BackEnd.Models;
using BackEnd.DTOs;

namespace BackEnd.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponse?> AuthenticateAsync(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return null;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || user.IsBanned)
                return null;

            // Hybrid auth: So sánh plain text HOẶC BCrypt hash
            bool isValidPassword = false;
            if (user.PasswordHash == request.Password)
            {
                isValidPassword = true;
            }
            else if (user.PasswordHash.StartsWith("$2a$") || user.PasswordHash.StartsWith("$2b$"))
            {
                // Kiểm tra BCrypt hash (cho tài khoản đã có hash cũ)
                try { isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash); } catch { isValidPassword = false; }
            }
            else if (user.PasswordHash == "hash_123" && request.Password == "hash_123")
            {
                // Placeholder cho test accounts
                isValidPassword = true;
            }

            if (!isValidPassword)
                return null;

            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                Token = GenerateToken(user),
                UserId = user.Id.ToString(),
                FullName = user.FullName,
                Role = user.Role,
                IsPremium = user.IsPremium
            };
        }

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
                return false;

            if (await _context.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
                return false;

            var user = new User
            {
                Email = request.Email.ToLower().Trim(),
                PasswordHash = request.Password, // Lưu plain text (ĐÃ BỎ BCrypt)
                FullName = request.FullName.Trim(),
                Role = "User"
            };

            _context.Users.Add(user);
            return await _context.SaveChangesAsync() > 0;
        }

        private string GenerateToken(User user)
        {
            var secretKey = _configuration["JwtConfig:Secret"] ?? "AILINGO_ENTERPRISE_SYSTEM_SECRET_KEY_2026";
            var key = Encoding.ASCII.GetBytes(secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim("Id", user.Id.ToString()),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }
    }
}
