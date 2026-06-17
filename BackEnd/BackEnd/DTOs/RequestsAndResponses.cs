using System;

namespace BackEnd.DTOs
{
    public class LoginRequest { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
    public class RegisterRequest { public string Email { get; set; } = ""; public string Password { get; set; } = ""; public string FullName { get; set; } = ""; }
    public class AuthResponse { public string Token { get; set; } = ""; public string FullName { get; set; } = ""; public string Role { get; set; } = ""; public bool IsPremium { get; set; } }

    public class AiGrammarRequest { public Guid UserId { get; set; } public string Text { get; set; } = ""; }
    public class AiGrammarResponse { public string Original { get; set; } = ""; public string Corrected { get; set; } = ""; public string Explanation { get; set; } = ""; }

    public class CreateLessonRequest { public Guid UnitId { get; set; } public string Title { get; set; } = ""; public string LessonType { get; set; } = "Vocab"; }
    public class ReplyQnaRequest { public Guid QnaId { get; set; } public Guid ManagerId { get; set; } public string AnswerText { get; set; } = ""; }

    public class BanUserRequest { public Guid UserId { get; set; } public string Reason { get; set; } = ""; }
    public class TicketResolveRequest { public Guid TicketId { get; set; } public Guid AdminId { get; set; } public string Reply { get; set; } = ""; }
}