using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEnd.Models
{
    [Table("USERS")]
    public class User
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required, MaxLength(150)] public string Email { get; set; } = string.Empty;
        [Required, MaxLength(255)] public string PasswordHash { get; set; } = string.Empty;
        [Required, MaxLength(100)] public string FullName { get; set; } = string.Empty;
        [MaxLength(50)] public string Role { get; set; } = "User";
        public bool IsBanned { get; set; } = false;
        [MaxLength(255)] public string? BanReason { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool IsPremium { get; set; } = false;
        public int TotalXP { get; set; } = 0;
        public int CurrentStreak { get; set; } = 0;
    }

    [Table("COURSES")]
    public class Course
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
        [Required, MaxLength(20)] public string TargetLanguage { get; set; } = "en";
        public bool IsPublished { get; set; } = false;
    }

    [Table("UNITS")]
    public class Unit
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid CourseId { get; set; }
        [ForeignKey("CourseId")] public Course? Course { get; set; }
        [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
    }

    [Table("LESSONS")]
    public class Lesson
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid UnitId { get; set; }
        [ForeignKey("UnitId")] public Unit? Unit { get; set; }
        [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
        [Required, MaxLength(50)] public string LessonType { get; set; } = "Vocab";
    }

    [Table("USER_PROGRESS")]
    public class UserProgress
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid UserId { get; set; }
        [ForeignKey("UserId")] public User? User { get; set; }
        [Required] public Guid LessonId { get; set; }
        [ForeignKey("LessonId")] public Lesson? Lesson { get; set; }
        [Required, MaxLength(50)] public string Status { get; set; } = "Locked";
        public double Score { get; set; } = 0;
        public DateTime? CompletedAt { get; set; }
    }

    [Table("AI_USAGE_LOGS")]
    public class AiUsageLog
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid UserId { get; set; }
        [ForeignKey("UserId")] public User? User { get; set; }
        [Required, MaxLength(100)] public string Feature { get; set; } = string.Empty;
        public int PromptTokens { get; set; }
        public int CompletionTokens { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("USER_FLASHCARDS")]
    public class UserFlashcard
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid UserId { get; set; }
        [ForeignKey("UserId")] public User? User { get; set; }
        [Required, MaxLength(100)] public string TargetWord { get; set; } = string.Empty;
        [Required, MaxLength(255)] public string Translation { get; set; } = string.Empty;
        public double EaseFactor { get; set; } = 2.5;
        public int IntervalDays { get; set; } = 0;
        public DateTime NextReviewDate { get; set; } = DateTime.UtcNow;
    }

    [Table("TRANSACTIONS")]
    public class Transaction
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid UserId { get; set; }
        [ForeignKey("UserId")] public User? User { get; set; }
        [Required, MaxLength(100)] public string GatewayTransactionId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        [Required, MaxLength(50)] public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("SUPPORT_TICKETS")]
    public class SupportTicket
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid SenderId { get; set; }
        [ForeignKey("SenderId")] public User? Sender { get; set; }
        public Guid? ResolverId { get; set; }
        [ForeignKey("ResolverId")] public User? Resolver { get; set; }
        [Required, MaxLength(100)] public string IssueCategory { get; set; } = string.Empty;
        [Required] public string Content { get; set; } = string.Empty;
        public string? AdminReply { get; set; }
        [Required, MaxLength(50)] public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
    }

    [Table("LESSON_QNA")]
    public class LessonQna
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid LessonId { get; set; }
        [ForeignKey("LessonId")] public Lesson? Lesson { get; set; }
        [Required] public Guid StudentId { get; set; }
        [ForeignKey("StudentId")] public User? Student { get; set; }
        public Guid? ManagerId { get; set; }
        [ForeignKey("ManagerId")] public User? Manager { get; set; }
        [Required] public string Question { get; set; } = string.Empty;
        public string? Answer { get; set; }
        [Required, MaxLength(50)] public string Status { get; set; } = "Unanswered";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("LEADERBOARDS")]
    public class Leaderboard
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid UserId { get; set; }
        [ForeignKey("UserId")] public User? User { get; set; }
        [Required, MaxLength(50)] public string LeagueTier { get; set; } = "Bronze";
        public DateTime WeekStartDate { get; set; }
        public int WeeklyXP { get; set; } = 0;
    }
}