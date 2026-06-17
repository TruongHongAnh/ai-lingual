import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getUserName, getUserRole, logout } from '../utils/auth';

export default function MainLayout() {
    const userName = getUserName() || 'Người dùng';
    const role = getUserRole();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            {/* THANH ĐIỀU HƯỚNG */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#0f172a', color: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ fontWeight: '900', fontSize: '24px', letterSpacing: '1px', color: '#38bdf8' }}>
                    🚀 AI LINGO
                </div>
                
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    {/* MENU CHO HỌC VIÊN */}
                    {role === 'User' && (
                        <>
                            <Link to="/student/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>🏠 Bảng điểm</Link>
                            <Link to="/student/ai-practice" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>🤖 Trợ lý AI</Link>
                        </>
                    )}

                    {/* MENU CHO CONTENT MANAGER */}
                    {role === 'ContentManager' && (
                        <Link to="/cm/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>✍️ Quản lý Nội dung</Link>
                    )}

                    {/* MENU CHO ADMIN */}
                    {role === 'Admin' && (
                        <Link to="/admin/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>👑 Quản trị Hệ thống</Link>
                    )}
                    
                    <div style={{ height: '24px', width: '1px', backgroundColor: '#475569' }}></div>
                    
                    <span style={{ color: '#e2e8f0' }}>Chào, <strong style={{ color: '#fbbf24' }}>{userName}</strong> ({role})</span>
                    
                    <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Đăng Xuất
                    </button>
                </div>
            </nav>

            {/* NỘI DUNG MÀN HÌNH CHÍNH */}
            <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
                <Outlet /> 
            </main>
        </div>
    );
}