# 🚀 AiLingo - Ứng dụng học ngoại ngữ tích hợp AI

Hệ thống học ngoại ngữ thông minh với trợ lý AI, lộ trình học cá nhân hóa, và quản lý tiến độ học tập.

## 🏗️ Công nghệ

- **Frontend**: React 19 + TypeScript 6 + Vite 8
- **Backend**: C# ASP.NET Core 8 (Web API)
- **Database**: SQL Server (Entity Framework Core)
- **Auth**: JWT + BCrypt password hashing

## 📁 Cấu trúc dự án

```
ai-lingual/
├── BackEnd/
│   └── BackEnd/
│       ├── Controllers/
│       │   ├── Public/          # Auth (login, register, forgot-password)
│       │   ├── User/            # Student (learning path, AI grammar check)
│       │   ├── Admin/           # Admin (users, tickets, transactions)
│       │   └── ContentManager/  # CM (courses, lessons, Q&A)
│       ├── Models/              # Entity classes (User, Course, Unit, Lesson...)
│       ├── Data/                # DbContext
│       ├── Services/            # AuthService, LearningService
│       ├── DTOs/                # Request/Response models
│       └── Program.cs           # Startup configuration
├── FrontEnd/
│   └── src/
│       ├── pages/
│       │   ├── Auth/            # Login, Signup
│       │   ├── Student/         # Dashboard, AI Practice, Learning Path
│       │   ├── Admin/           # Admin Dashboard
│       │   └── CM/              # Content Manager Dashboard
│       ├── components/          # Header
│       ├── layouts/             # MainLayout
│       ├── routes/              # ProtectedRoute
│       ├── services/            # apiClient (Axios)
│       └── utils/               # auth helpers (JWT decode, logout)
└── README.md
```

## 🚀 Cài đặt & Chạy

### 1. Database

Chạy file `FrontEnd/AiLingoDB.sql` trong SQL Server Management Studio (SSMS) để tạo database và seed dữ liệu mẫu.

### 2. Backend

```bash
cd BackEnd/BackEnd
dotnet restore
dotnet run
# API tại: https://localhost:7130 (hoặc http://localhost:5023)
# Swagger:  https://localhost:7130/swagger
```

### 3. Frontend

```bash
cd FrontEnd
npm install
npm run dev
# App tại: http://localhost:5173
```

## 🔑 Tài khoản test

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| 👨‍🎓 Học viên VIP | vipuser@gmail.com | 123456 |
| 👨‍🎓 Học viên thường | normal@gmail.com | hash_123 |
| 👨‍💼 Quản trị viên | admin@ailingo.vn | hash_123 |
| ✏️ Biên tập viên | cm1@ailingo.vn | hash_123 |
| ⛔ Tài khoản bị khóa | spammer@gmail.com | hash_123 |

## 🧩 Các API chính

### Public
- `POST /api/public/auth/login` - Đăng nhập
- `POST /api/public/auth/register` - Đăng ký
- `POST /api/public/auth/forgot-password` - Quên mật khẩu

### Student (User)
- `GET /api/user/student/learning-path?lang=en` - Lộ trình học
- `GET /api/user/student/menu-data` - Menu languages
- `POST /api/user/student/ai-grammar-check` - Kiểm tra ngữ pháp AI

### Admin
- `GET /api/admin/admin/users` - Danh sách người dùng
- `PUT /api/admin/admin/ban-violator` - Khóa tài khoản
- `GET /api/admin/tickets/all-pending` - Khiếu nại chờ xử lý
- `GET /api/admin/transactions/history` - Lịch sử giao dịch

### Content Manager
- `GET /api/cm/courses/all` - Danh sách khóa học
- `POST /api/cm/courses/create` - Tạo khóa học
- `GET /api/cm/qna/pending` - Câu hỏi chưa trả lời
- `PUT /api/cm/cm/reply-student-qna` - Trả lời câu hỏi

## 📝 Lưu ý

- Cổng backend mặc định: `7130` (HTTPS) — kiểm tra trong `FrontEnd/src/services/apiClient.ts` và `launchSettings.json`
- JWT secret key cấu hình trong `appsettings.json`
- Dữ liệu mẫu có sẵn file `AiLingoDB.sql` (80+ dòng seed data)
