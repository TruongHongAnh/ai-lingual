using System;
using System.ComponentModel.DataAnnotations;

namespace BackEnd.DTOs
{
    public class LoginRequest 
    { 
        [Required(ErrorMessage = "Email không được bỏ trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = ""; 
        
        [Required(ErrorMessage = "Mật khẩu không được bỏ trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = ""; 
    }

    public class RegisterRequest 
    { 
        [Required(ErrorMessage = "Email không được bỏ trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = ""; 
        
        [Required(ErrorMessage = "Mật khẩu không được bỏ trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = ""; 
        
        [Required(ErrorMessage = "Tên không được bỏ trống")]
        [MinLength(3, ErrorMessage = "Tên phải có ít nhất 3 ký tự")]
        [MaxLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự")]
        public string FullName { get; set; } = ""; 
    }

    public class AuthResponse 
    { 
        public string Token { get; set; } = ""; 
        public string UserId { get; set; } = ""; 
        public string FullName { get; set; } = ""; 
        public string Role { get; set; } = ""; 
        public bool IsPremium { get; set; } 
    }

    public class AiGrammarRequest { public Guid UserId { get; set; } public string Text { get; set; } = ""; }
    public class AiGrammarResponse { public string Original { get; set; } = ""; public string Corrected { get; set; } = ""; public string Explanation { get; set; } = ""; }

    public class CreateLessonRequest { public Guid UnitId { get; set; } public string Title { get; set; } = ""; public string LessonType { get; set; } = "Vocab"; }
    public class ReplyQnaRequest { public Guid QnaId { get; set; } public Guid ManagerId { get; set; } public string AnswerText { get; set; } = ""; }

    public class BanUserRequest { public Guid UserId { get; set; } public string Reason { get; set; } = ""; }
    public class TicketResolveRequest { public Guid TicketId { get; set; } public Guid AdminId { get; set; } public string Reply { get; set; } = ""; }
    public class ForgotPasswordRequest { public string Email { get; set; } = ""; }
}
