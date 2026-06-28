using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;

namespace BackEnd.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TransactionsController(AppDbContext context) { _context = context; }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            // BƯỚC 1: Lấy dữ liệu thô từ Database (SQL không hiểu ToString nên ta lấy nguyên DateTime)
            var rawTxns = await _context.Transactions
                .Include(t => t.User) // Bắt buộc phải có Include để không bị null User
                .OrderByDescending(t => t.CreatedAt) // Sắp xếp ngày mới nhất lên đầu
                .Select(t => new
                {
                    t.Id,
                    UserEmail = t.User != null ? t.User.Email : "Unknown",
                    t.GatewayTransactionId,
                    t.Amount,
                    t.Status,
                    t.Note,
                    t.CreatedAt // Lấy nguyên bản kiểu DateTime
                })
                .ToListAsync(); // Chạy câu lệnh SQL và tải dữ liệu lên RAM

            // BƯỚC 2: Dùng C# trên RAM để format lại giao diện ngày tháng
            var txns = rawTxns.Select(t => new
            {
                t.Id,
                t.UserEmail,
                t.GatewayTransactionId,
                t.Amount,
                t.Status,
                Note = t.Note,
                createdAt = t.CreatedAt.ToString("dd/MM/yyyy HH:mm") // Lúc này C# đã hiểu và format mượt mà
            });

            return Ok(txns);
        }
    }
}
