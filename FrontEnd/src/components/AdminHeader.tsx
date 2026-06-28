import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import { logout } from '../utils/auth';

export default function AdminHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const openMenu = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsUserMenuOpen(true);
    };

    const closeMenu = () => {
        timerRef.current = setTimeout(() => {
            setIsUserMenuOpen(false);
        }, 150);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname.includes(path);

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 40px', backgroundColor: '#1e293b', borderBottom: '1px solid #0f172a', position: 'sticky', top: 0, zIndex: 50, fontFamily: 'Inter, sans-serif' }}>
            
            <style>
                {`
                    .admin-nav-link { text-decoration: none; color: #94a3b8; font-weight: 600; font-size: 14px; padding: 8px 16px; border-radius: 8px; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; }
                    .admin-nav-link:hover { background: #334155; color: #fff; }
                    .admin-nav-link.active { background: #ef4444; color: #fff; font-weight: 800; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); }
                    
                    .dropdown-item { padding: 12px 20px; cursor: pointer; color: #475569; font-size: 14px; display: flex; align-items: center; gap: 10px; transition: all 0.2s; border-left: 3px solid transparent; }
                    .dropdown-item:hover { background-color: #f1f5f9; color: #ef4444; }
                    
                    .dropdown-box { position: absolute; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); z-index: 100; animation: dropFade 0.2s ease-out forwards; }
                    .dropdown-box::before { content: ''; position: absolute; top: -20px; left: 0; width: 100%; height: 20px; background: transparent; }
                    @keyframes dropFade { from { opacity: 0; margin-top: -8px; pointer-events: none; } to { opacity: 1; margin-top: 0; pointer-events: auto; } }
                `}
            </style>

            {/* LOGO ADMIN */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>
                    <span style={{ fontSize: '28px' }}>🛡️</span>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', letterSpacing: '-0.5px' }}>AiLingo <span style={{ color: '#ef4444' }}>Admin</span></span>
                </div>
            </div>

            {/* MENU QUẢN TRỊ (ĐÃ SỬA LẠI ĐÚNG ĐƯỜNG DẪN) */}
            <nav style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                <Link to="/admin/dashboard" className={`admin-nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}><span>📊</span> Tổng quan</Link>
                <Link to="/admin/users" className={`admin-nav-link ${isActive('/admin/users') ? 'active' : ''}`}><span>👥</span> Quản lý Người dùng</Link>
                <Link to="/admin/approvals" className={`admin-nav-link ${isActive('/admin/approvals') ? 'active' : ''}`}><span>✅</span> Xét duyệt Giáo trình</Link>
                <Link to="/admin/tickets" className={`admin-nav-link ${isActive('/admin/tickets') ? 'active' : ''}`}><span>🎫</span> Hỗ trợ & Khiếu nại</Link>
                <Link to="/admin/finance" className={`admin-nav-link ${isActive('/admin/finance') ? 'active' : ''}`}><span>💰</span> Doanh thu</Link>
            </nav>

            {/* AVATAR ADMIN */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} onMouseEnter={openMenu} onMouseLeave={closeMenu}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: '900', color: '#fff', fontSize: '15px' }}>Trùm Quản Trị</span>
                            <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>System Admin 👑</span>
                        </div>
                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', backgroundColor: '#ef4444', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '20px', border: '2px solid #fff', boxShadow: '0 2px 10px rgba(239, 68, 68, 0.5)' }}>
                            A
                        </div>
                    </div>

                    {isUserMenuOpen && (
                        <div className="dropdown-box" style={{ top: '55px', right: '0', width: '200px', padding: '8px 0', borderRadius: '12px' }}>
                            <div className="dropdown-item"><span style={{ fontSize: '18px' }}>⚙️</span> Cài đặt Máy chủ</div>
                            <div className="dropdown-item"><span style={{ fontSize: '18px' }}>🗄️</span> Sao lưu Dữ liệu</div>
                            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '8px 0' }}></div>
                            <div className="dropdown-item" onClick={handleLogout} style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                <span style={{ fontSize: '18px' }}>🚪</span> Đăng xuất
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}