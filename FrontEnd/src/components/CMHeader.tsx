import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';
import { logout } from '../utils/auth';

export default function CMHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userInfo, setUserInfo] = useState({
        fullName: 'Đang tải...',
        plan: 'Đang tải...'
    });

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

    // Hàm format chức danh siêu ngầu
    const formatRole = (langCode: string) => {
        if (langCode === 'en') return 'Biên tập viên Tiếng Anh 🇬🇧';
        if (langCode === 'ja') return 'Biên tập viên Tiếng Nhật 🇯🇵';
        if (langCode === 'zh') return 'Biên tập viên Tiếng Trung 🇨🇳';
        if (langCode === 'all') return 'Trưởng nhóm Nội dung 🌐';
        return 'Biên tập viên Nội dung 📝';
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRes = await apiClient.get('/user/student/profile'); 
                if (profileRes.data) {
                    setUserInfo({ 
                        fullName: profileRes.data.fullName || 'Biên tập viên',
                        // 👉 DỊCH MÃ NGÔN NGỮ TỪ DATABASE RA TEXT HIỂN THỊ
                        plan: formatRole(profileRes.data.managedLanguage)
                    });
                }
            } catch (error) { console.error("Lỗi lấy Avatar CM"); }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname.includes(path);
    const avatarLetter = userInfo.fullName !== 'Đang tải...' ? userInfo.fullName.charAt(0).toUpperCase() : 'U';

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, fontFamily: 'Inter, sans-serif' }}>
            
            <style>
                {`
                    .nav-link { text-decoration: none; color: #475569; font-weight: 600; font-size: 15px; padding-bottom: 6px; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
                    .nav-link:hover { color: #7c3aed; border-bottom: 3px solid #ddd6fe; }
                    .nav-link.active { color: #7c3aed; font-weight: 800; border-bottom: 3px solid #7c3aed; }
                    
                    .dropdown-item { padding: 12px 20px; cursor: pointer; color: #475569; font-size: 14px; display: flex; align-items: center; gap: 10px; transition: all 0.2s; border-left: 3px solid transparent; }
                    .dropdown-item:hover { background-color: #f1f5f9; color: #7c3aed; }
                    .dropdown-item.active { background-color: #f8fafc; font-weight: bold; color: #7c3aed; border-left: 3px solid #7c3aed; padding-left: 17px; }

                    .dropdown-box { position: absolute; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); z-index: 100; animation: dropFade 0.2s ease-out forwards; }
                    .dropdown-box::before { content: ''; position: absolute; top: -20px; left: 0; width: 100%; height: 20px; background: transparent; }
                    @keyframes dropFade { from { opacity: 0; margin-top: -8px; pointer-events: none; } to { opacity: 1; margin-top: 0; pointer-events: auto; } }
                `}
            </style>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/cm/dashboard')}>
                    <span style={{ fontSize: '28px' }}>🚀</span>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '-0.5px' }}>AiLingo</span>
                </div>
            </div>

            <nav style={{ display: 'flex', gap: '35px', alignItems: 'center', justifyContent: 'center' }}>
                {/* ĐÃ THÊM TAB DASHBOARD RÕ RÀNG */}
                <Link to="/cm/dashboard" className={`nav-link ${isActive('/cm/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                <Link to="/cm/curriculum" className={`nav-link ${isActive('/cm/curriculum') ? 'active' : ''}`}>Giáo trình</Link>
                <Link to="/cm/qna" className={`nav-link ${isActive('/cm/qna') ? 'active' : ''}`}>Q&A Học viên</Link>
                <Link to="/cm/report" className={`nav-link ${isActive('/cm/report') ? 'active' : ''}`}>Báo cáo</Link>
            </nav>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '15px' }}>{userInfo.fullName}</span>
                    <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>{userInfo.plan}</span>
                </div>

                <div 
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={openMenu}
                    onMouseLeave={closeMenu}
                >
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#7c3aed', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)', transition: 'transform 0.2s' }}>
                        {avatarLetter}
                    </div>

                    {isUserMenuOpen && (
                        <div className="dropdown-box" style={{ top: '55px', right: '-10px', width: '220px', padding: '8px 0', borderRadius: '16px' }}>
                            <div className={`dropdown-item ${isActive('/cm/profile') ? 'active' : ''}`} onClick={() => navigate('/cm/profile')}>
                                <span style={{ fontSize: '18px' }}>👤</span> Hồ sơ cá nhân
                            </div>
                            <div className="dropdown-item"><span style={{ fontSize: '18px' }}>⚙️</span> Cài đặt hệ thống</div>
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