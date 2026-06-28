import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

// Nhập các Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import StudentDashboard from './pages/Student/StudentDashboard';
import AiPractice from './pages/Student/AiPractice';
import CMDashboard from './pages/CM/CMDashboard'; 
import AdminDashboard from './pages/Admin/AdminDashboard'; 
import LearningPath from './pages/Student/LearningPath';
import CameraScanner from './pages/Student/CameraScanner';
import UserProfile from './pages/Student/UserProfile';
import Dictionary from './pages/Student/Dictionary';
import LessonStudy from './pages/Student/LessonStudy';
import Notebook from './pages/Student/Notebook';
import CMCurriculum from './pages/CM/CMCurriculum';
import CMQna from './pages/CM/CMQna';
import CMReport from './pages/CM/CMReport';

// 👉 NHẬP CÁC TRANG CHỨC NĂNG RIÊNG CỦA ADMIN
import AdminApprovals from './pages/Admin/AdminApprovals';
import AdminTickets from './pages/Admin/AdminTickets';
import AdminFinance from './pages/Admin/AdminFinance';
import AdminUsers from './pages/Admin/AdminUsers';

import UserHeader from './components/UserHeader';
import CMHeader from './components/CMHeader';
import AdminHeader from './components/AdminHeader';

// ==============================================================
// ĐỊNH NGHĨA CÁC BỘ BỐ CỤC (LAYOUTS) CHO TỪNG ĐỐI TƯỢNG
// ==============================================================

const StudentLayout = () => (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <UserHeader />
        <Outlet />
    </div>
);

const CMLayout = () => (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <CMHeader />
        <Outlet />
    </div>
);

const AdminLayout = () => (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        {/* 👉 ĐÃ SỬA: Đưa AdminHeader vào đúng vị trí */}
        <AdminHeader /> 
        <Outlet />
    </div>
);

// ==============================================================
// LUỒNG ĐIỀU HƯỚNG CHÍNH (ROUTING)
// ==============================================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/unauthorized" element={<h2 style={{ textAlign: 'center', marginTop: '100px' }}>⛔ Truy cập bị từ chối!</h2>} />

        {/* ======================================= */}
        {/* 1. KÊNH HỌC VIÊN (USER)                 */}
        {/* ======================================= */}
        <Route element={<ProtectedRoute allowedRoles={['User', 'Admin']} />}>
            <Route element={<StudentLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/ai-practice" element={<AiPractice />} />
                <Route path="/student/camera-scanner" element={<CameraScanner />} />
                <Route path="/student/profile" element={<UserProfile />} />
                <Route path="/student/dictionary" element={<Dictionary />} />
                <Route path="/student/lesson/:lessonId" element={<LessonStudy />} />
                <Route path="/student/notebook" element={<Notebook />} />
                <Route path="/student/path" element={<LearningPath />} />
            </Route>
        </Route>

        {/* ======================================= */}
        {/* 2. KÊNH BIÊN TẬP VIÊN (CONTENT MANAGER) */}
        {/* ======================================= */}
        <Route element={<ProtectedRoute allowedRoles={['ContentManager', 'Admin']} />}>
            <Route element={<CMLayout />}>
                <Route path="/cm/dashboard" element={<CMDashboard />} />
                <Route path="/cm/curriculum" element={<CMCurriculum />} />
                <Route path="/cm/qna" element={<CMQna />} />
                <Route path="/cm/profile" element={<UserProfile />} />
                <Route path="/cm/report" element={<CMReport />} />
            </Route>
        </Route>

        {/* ======================================= */}
        {/* 3. KÊNH QUẢN TRỊ VIÊN (ADMIN)           */}
        {/* ======================================= */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                {/* 👉 ĐÃ TÁCH RÕ RÀNG CÁC CHỨC NĂNG RA PAGE RIÊNG */}
                <Route path="/admin/approvals" element={<AdminApprovals />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/admin/finance" element={<AdminFinance />} />
                <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
        </Route>

        {/* CATCH ALL: Lỗi gõ bậy bạ thì đẩy về Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}