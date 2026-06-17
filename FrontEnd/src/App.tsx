import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Nhập các Pages
import Login from './pages/Auth/Login';
import StudentDashboard from './pages/Student/StudentDashboard';
import AiPractice from './pages/Student/AiPractice';
import CMDashboard from './pages/CM/CMDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard'; // (Màn hình bạn đã tạo lúc trước)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<h2 style={{ textAlign: 'center', marginTop: '100px' }}>⛔ Truy cập bị từ chối!</h2>} />

        {/* ======================================= */}
        {/* 1. KÊNH HỌC VIÊN (USER)                 */}
        {/* ======================================= */}
        <Route element={<ProtectedRoute allowedRoles={['User', 'Admin']} />}>
            <Route element={<MainLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/ai-practice" element={<AiPractice />} />
            </Route>
        </Route>

        {/* ======================================= */}
        {/* 2. KÊNH BIÊN TẬP VIÊN (CONTENT MANAGER) */}
        {/* ======================================= */}
        <Route element={<ProtectedRoute allowedRoles={['ContentManager', 'Admin']} />}>
            <Route element={<MainLayout />}>
                <Route path="/cm/dashboard" element={<CMDashboard />} />
            </Route>
        </Route>

        {/* ======================================= */}
        {/* 3. KÊNH QUẢN TRỊ VIÊN (ADMIN)           */}
        {/* ======================================= */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<MainLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
        </Route>

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}