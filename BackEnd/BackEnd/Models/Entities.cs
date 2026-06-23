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

        // 👉 3 TRƯỜNG MỚI ĐƯỢC THÊM VÀO CHO PROFILE
        [MaxLength(20)] public string? Phone { get; set; }
        public DateTime? Dob { get; set; }
        [MaxLength(1000)] public string? Bio { get; set; }

        [MaxLength(50)] public string Role { get; set; } = "User";
        public bool IsBanned { get; set; } = false;
        [MaxLength(255)] public string? BanReason { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool IsPremium { get; set; } = false;
        public int TotalXP { get; set; } = 0;
        public int CurrentStreak { get; set; } = 0;

        public string? ManagedLanguage { get; set; } = "all";
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
        [Required, StringLength(255)] public string Title { get; set; } = string.Empty;
        [StringLength(500)] public string Description { get; set; } = string.Empty;
        [Required, StringLength(10)] public string LanguageCode { get; set; } = "en";
        public int OrderIndex { get; set; }
        [StringLength(7)] public string ColorHex { get; set; } = "#10b981";
    }

    [Table("LESSONS")]
    public class Lesson
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid UnitId { get; set; }
        [ForeignKey("UnitId")] public Unit? Unit { get; set; }

        [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
        [Required, MaxLength(50)] public string LessonType { get; set; } = "Vocab";

        public int OrderIndex { get; set; } // Thứ tự bài học
        public int XpReward { get; set; } = 50; // XP nhận được khi hoàn thành

        public string? ApprovalStatus { get; set; } = "Pending";
        public Guid? LockedById { get; set; }
        public DateTime? LockedUntil { get; set; }
    }

    [Table("USER_PROGRESS")]
    public class UserProgress
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required] public Guid UserId { get; set; }
        [ForeignKey("UserId")] public User? User { get; set; }

        [Required] public Guid LessonId { get; set; }
        [ForeignKey("LessonId")] public Lesson? Lesson { get; set; }

        [Required, MaxLength(50)] public string Status { get; set; } = "Completed"; // Locked, Active, Completed
        public double Score { get; set; } = 0;
        public DateTime? CompletedAt { get; set; }
    }

    [Table("AI_USAGE_LOGS")]
    public class AiUsageLog { [Key] public Guid Id { get; set; } = Guid.NewGuid(); [Required] public Guid UserId { get; set; } [ForeignKey("UserId")] public User? User { get; set; } [Required, MaxLength(100)] public string Feature { get; set; } = string.Empty; public int PromptTokens { get; set; } public int CompletionTokens { get; set; } public DateTime CreatedAt { get; set; } = DateTime.UtcNow; }

    [Table("USER_FLASHCARDS")]
    public class UserFlashcard { [Key] public Guid Id { get; set; } = Guid.NewGuid(); [Required] public Guid UserId { get; set; } [ForeignKey("UserId")] public User? User { get; set; } [Required, MaxLength(100)] public string TargetWord { get; set; } = string.Empty; [Required, MaxLength(255)] public string Translation { get; set; } = string.Empty; public double EaseFactor { get; set; } = 2.5; public int IntervalDays { get; set; } = 0; public DateTime NextReviewDate { get; set; } = DateTime.UtcNow; }

    [Table("TRANSACTIONS")]
    public class Transaction { [Key] public Guid Id { get; set; } = Guid.NewGuid(); [Required] public Guid UserId { get; set; } [ForeignKey("UserId")] public User? User { get; set; } [Required, MaxLength(100)] public string GatewayTransactionId { get; set; } = string.Empty; public decimal Amount { get; set; } [Required, MaxLength(50)] public string Status { get; set; } = "Pending"; public DateTime CreatedAt { get; set; } = DateTime.UtcNow; }

    [Table("SUPPORT_TICKETS")]
    public class SupportTicket { [Key] public Guid Id { get; set; } = Guid.NewGuid(); [Required] public Guid SenderId { get; set; } [ForeignKey("SenderId")] public User? Sender { get; set; } public Guid? ResolverId { get; set; } [ForeignKey("ResolverId")] public User? Resolver { get; set; } [Required, MaxLength(100)] public string IssueCategory { get; set; } = string.Empty; [Required] public string Content { get; set; } = string.Empty; public string? AdminReply { get; set; } [Required, MaxLength(50)] public string Status { get; set; } = "Pending"; public DateTime CreatedAt { get; set; } = DateTime.UtcNow; public DateTime? ResolvedAt { get; set; } }

    [Table("LESSON_QNA")]
    public class LessonQna { [Key] public Guid Id { get; set; } = Guid.NewGuid(); [Required] public Guid LessonId { get; set; } [ForeignKey("LessonId")] public Lesson? Lesson { get; set; } [Required] public Guid StudentId { get; set; } [ForeignKey("StudentId")] public User? Student { get; set; } public Guid? ManagerId { get; set; } [ForeignKey("ManagerId")] public User? Manager { get; set; } [Required] public string Question { get; set; } = string.Empty; public string? Answer { get; set; } [Required, MaxLength(50)] public string Status { get; set; } = "Unanswered"; public DateTime CreatedAt { get; set; } = DateTime.UtcNow; }

    [Table("LEADERBOARDS")]
    public class Leaderboard { [Key] public Guid Id { get; set; } = Guid.NewGuid(); [Required] public Guid UserId { get; set; } [ForeignKey("UserId")] public User? User { get; set; } [Required, MaxLength(50)] public string LeagueTier { get; set; } = "Bronze"; public DateTime WeekStartDate { get; set; } public int WeeklyXP { get; set; } = 0; }

    [Table("VOCABULARIES")]
    public class Vocabulary
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();
        [Required, MaxLength(10)] public string LanguageCode { get; set; } = "en";
        [Required, MaxLength(100)] public string Word { get; set; } = string.Empty;
        [Required, MaxLength(255)] public string Meaning { get; set; } = string.Empty;
        [MaxLength(100)] public string? Pronunciation { get; set; }
        [MaxLength(50)] public string? PartOfSpeech { get; set; }
        [MaxLength(500)] public string? ExampleSentence { get; set; }
        [MaxLength(500)] public string? ExampleTranslation { get; set; }
        [MaxLength(255)] public string? AudioUrl { get; set; }
    }

    [Table("LESSON_VOCABULARIES")]
    public class LessonVocabulary
    {
        [Key] public Guid Id { get; set; } = Guid.NewGuid();

        [Required] public Guid LessonId { get; set; }
        [ForeignKey("LessonId")] public Lesson? Lesson { get; set; }

        [Required] public Guid VocabId { get; set; }
        [ForeignKey("VocabId")] public Vocabulary? Vocabulary { get; set; }

        public int OrderIndex { get; set; } = 0;
    }
}