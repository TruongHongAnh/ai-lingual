using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Data;
using BackEnd.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context) { _context = context; }

        [HttpPut("ban-violator")]
        public async Task<IActionResult> BanUser([FromBody] BanUserRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng vi phạm!" });

            user.IsBanned = true;
            user.BanReason = request.Reason;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Tài khoản {user.Email} đã bị khóa vĩnh viễn trên toàn hệ thống!" });
        }

        [HttpPut("resolve-support-ticket")]
        public async Task<IActionResult> ResolveTicket([FromBody] TicketResolveRequest request)
        {
            var ticket = await _context.SupportTickets.FindAsync(request.TicketId);
            if (ticket == null) return NotFound(new { message = "Phiếu khiếu nại tài khoản không tồn tại!" });

            ticket.ResolverId = request.AdminId;
            ticket.AdminReply = request.Reply;
            ticket.Status = "Resolved";
            ticket.ResolvedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xử lý xong khiếu nại và phản hồi lại cho khách hàng!" });
        }
        // BỔ SUNG: API Lấy danh sách người dùng từ Database
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Role,
                    u.IsBanned,
                    u.BanReason,
                    u.TotalXP
                })
                .ToListAsync();
            return Ok(users);
        }
    }
}