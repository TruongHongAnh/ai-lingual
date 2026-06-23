using Microsoft.EntityFrameworkCore;
using BackEnd.Models;

namespace BackEnd.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<UserProgress> UserProgresses { get; set; }
        public DbSet<AiUsageLog> AiUsageLogs { get; set; }
        public DbSet<UserFlashcard> UserFlashcards { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<LessonQna> LessonQnas { get; set; }
        public DbSet<Leaderboard> Leaderboards { get; set; }

        public DbSet<Vocabulary> Vocabularies { get; set; }
        public DbSet<LessonVocabulary> LessonVocabularies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ràng buộc bảo mật tài khoản duy nhất
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Khóa chặt Cascade Path chống lỗi đứt gãy dữ liệu vòng lặp
            modelBuilder.Entity<SupportTicket>()
                .HasOne(s => s.Sender).WithMany().HasForeignKey(s => s.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SupportTicket>()
                .HasOne(s => s.Resolver).WithMany().HasForeignKey(s => s.ResolverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LessonQna>()
                .HasOne(q => q.Student).WithMany().HasForeignKey(q => q.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LessonQna>()
                .HasOne(q => q.Manager).WithMany().HasForeignKey(q => q.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}