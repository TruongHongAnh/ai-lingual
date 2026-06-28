using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using System.Collections.Generic;

namespace BackEnd.Controllers.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context) { _context = context; }

        // ==========================================
        // 1. LẤY SỐ LIỆU TỔNG QUAN (DASHBOARD)
        // ==========================================
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.Role == "User");
            var premiumUsers = await _context.Users.CountAsync(u => u.IsPremium == true);
            var totalRevenue = await _context.Transactions.Where(t => t.Status == "Success").SumAsync(t => t.Amount);
            var pendingTickets = await _context.SupportTickets.CountAsync(t => t.Status == "Pending");

            return Ok(new { totalUsers, premiumUsers, totalRevenue, pendingTickets });
        }

        // ==========================================
        // 2. VẼ BIỂU ĐỒ DOANH THU (TÙY CHỌN 7 NGÀY, 30 NGÀY, HOẶC 1 NĂM)
        // ==========================================
        [HttpGet("revenue-chart")]
        public async Task<IActionResult> GetRevenueChart([FromQuery] string range = "7d")
        {
            DateTime startDate = DateTime.UtcNow.AddDays(-6).Date;
            if (range == "30d") startDate = DateTime.UtcNow.AddDays(-29).Date;
            if (range == "1y") startDate = new DateTime(DateTime.UtcNow.Year, 1, 1);

            // Fetch dữ liệu thô về RAM trước để tránh lỗi dịch EF Core
            var rawData = await _context.Transactions
                .Where(t => t.Status == "Success" && t.CreatedAt >= startDate)
                .Select(t => new { t.CreatedAt, t.Amount })
                .ToListAsync();

            var stats = new List<object>();

            if (range == "1y")
            {
                // Nhóm theo Tháng
                var grouped = rawData.GroupBy(t => t.CreatedAt.Month).ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));
                for (int i = 1; i <= 12; i++)
                {
                    stats.Add(new { day = $"T{i}", total = grouped.ContainsKey(i) ? grouped[i] : 0 });
                }
            }
            else
            {
                // Nhóm theo Ngày (7d hoặc 30d)
                int days = range == "30d" ? 30 : 7;
                var grouped = rawData.GroupBy(t => t.CreatedAt.Date).ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));
                string[] daysOfWeek = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };

                for (int i = 0; i < days; i++)
                {
                    var d = startDate.AddDays(i);
                    // Nếu 7 ngày thì hiển thị Thứ (T2, T3). Nếu 30 ngày thì hiển thị Ngày/Tháng (01/05)
                    string label = range == "7d" ? daysOfWeek[(int)d.DayOfWeek] : d.ToString("dd/MM");
                    stats.Add(new { day = label, total = grouped.ContainsKey(d) ? grouped[d] : 0 });
                }
            }
            return Ok(stats);
        }

        // ==========================================
        // 3. VẼ BIỂU ĐỒ TĂNG TRƯỞNG NGƯỜI DÙNG (7 NGÀY, 30 NGÀY, 1 NĂM)
        // ==========================================
        [HttpGet("user-growth-chart")]
        public async Task<IActionResult> GetUserGrowthChart([FromQuery] string range = "7d")
        {
            DateTime startDate = DateTime.UtcNow.AddDays(-6).Date;
            if (range == "30d") startDate = DateTime.UtcNow.AddDays(-29).Date;
            if (range == "1y") startDate = new DateTime(DateTime.UtcNow.Year, 1, 1);

            var rawData = await _context.Users
                .Where(u => u.Role == "User" && u.LastLogin >= startDate)
                .Select(u => new { u.LastLogin })
                .ToListAsync();

            var stats = new List<object>();

            if (range == "1y")
            {
                var grouped = rawData.Where(u => u.LastLogin.HasValue).GroupBy(u => u.LastLogin.Value.Month).ToDictionary(g => g.Key, g => g.Count());
                for (int i = 1; i <= 12; i++)
                {
                    stats.Add(new { day = $"T{i}", count = grouped.ContainsKey(i) ? grouped[i] : 0 });
                }
            }
            else
            {
                int days = range == "30d" ? 30 : 7;
                var grouped = rawData.Where(u => u.LastLogin.HasValue).GroupBy(u => u.LastLogin.Value.Date).ToDictionary(g => g.Key, g => g.Count());
                string[] daysOfWeek = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };

                for (int i = 0; i < days; i++)
                {
                    var d = startDate.AddDays(i);
                    string label = range == "7d" ? daysOfWeek[(int)d.DayOfWeek] : d.ToString("dd/MM");
                    stats.Add(new { day = label, count = grouped.ContainsKey(d) ? grouped[d] : 0 });
                }
            }
            return Ok(stats);
        }

        // ==========================================
        // 4. CÁC API QUẢN LÝ USER KHÁC...
        // ==========================================
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.OrderBy(u => u.Role == "Admin" ? 0 : u.Role == "ContentManager" ? 1 : 2).Select(u => new { id = u.Id, fullName = u.FullName, email = u.Email, role = u.Role, xp = u.TotalXP, isBanned = u.IsBanned, banReason = u.BanReason }).ToListAsync();
            return Ok(users);
        }

        [HttpPost("users/{id}/toggle-ban")]
        public async Task<IActionResult> ToggleBan(Guid id, [FromBody] BanUserReq req)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy!" });
            if (user.Role == "Admin") return BadRequest(new { message = "Không thể khóa Admin!" });
            user.IsBanned = !user.IsBanned;
            user.BanReason = user.IsBanned ? req.Reason : null;
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Thao tác thành công!" });
        }
    }
    public class BanUserReq { public string Reason { get; set; } = ""; }
}