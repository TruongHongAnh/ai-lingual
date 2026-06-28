using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;

namespace BackEnd.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TicketsController(AppDbContext context) { _context = context; }

        [HttpGet("all-pending")]
        public async Task<IActionResult> GetPendingTickets()
        {
            var tickets = await _context.SupportTickets
                .Where(t => t.Status == "Pending" || t.Status == "Processing")
                .Select(t => new
                {
                    t.Id,
                    SenderName = t.Sender!.FullName,
                    t.IssueCategory,
                    t.Content,
                    t.Status
                })
                .ToListAsync();
            return Ok(tickets);
        }
    }
}
