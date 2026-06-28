import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';
import { logout } from '../utils/auth';

interface MenuDataResponse { languages: string[]; }

// Đã bỏ tham số { role } vì Header này CHỈ dành cho Học viên
export default function UserHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const [languages, setLanguages] = useState<string[]>([]);
    const [currentLang, setCurrentLang] = useState<string>('en');

    const [userInfo, setUserInfo] = useState({
        fullName: 'User',
        plan: 'Học viên Tiêu chuẩn 🥉'
    });

    const [isToolOpen, setIsToolOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const timerRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const openMenu = (menu: string) => {
        clearTimeout(timerRefs.current[menu]);
        if (menu === 'tool') setIsToolOpen(true);
        if (menu === 'lang') setIsLangOpen(true);
        if (menu === 'user') setIsUserMenuOpen(true);
    };

    const closeMenu = (menu: string) => {
        timerRefs.current[menu] = setTimeout(() => {
            if (menu === 'tool') setIsToolOpen(false);
            if (menu === 'lang') setIsLangOpen(false);
            if (menu === 'user') setIsUserMenuOpen(false);
        }, 150);
    };

    useEffect(() => {
        // Lấy danh sách ngôn ngữ
        const fetchHeaderData = async () => {
            try {
                const menuRes = await apiClient.get<MenuDataResponse>('/user/student/menu-data');
                setLanguages(menuRes.data.languages);
            } catch (error) { console.error("Lỗi lấy menu"); }

            // Lấy thông tin Avatar Học viên
            try {
                const profileRes = await apiClient.get('/user/student/profile');
                if (profileRes.data) {
                    setUserInfo({ 
                        fullName: profileRes.data.fullName || 'User',
                        plan: profileRes.data.isPremium ? 'Học viên Premium ✨' : 'Học viên Tiêu chuẩn 🥉'
                    });
                }
            } catch (error) { console.error("Lỗi lấy Avatar"); }
        };
        fetchHeaderData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getLanguageName = (code: string) => {
        const map: Record<string, string> = { 'en': 'Tiếng Anh', 'ja': 'Tiếng Nhật', 'zh': 'Tiếng Trung' };
        return map[code] || code;
    };

    const getLanguageFlag = (code: string) => {
        const map: Record<string, string> = { 'en': '🇺🇸', 'ja': '🇯🇵', 'zh': '🇨🇳' };
        return map[code] || '🌐';
    };

    const isActive = (path: string) => location.pathname.includes(path);
    const isAiToolActive = isActive('/ai-practice') || isActive('/camera-scanner');
    const avatarLetter = userInfo.fullName.charAt(0).toUpperCase();

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, fontFamily: 'Inter, sans-serif' }}>
            
            <style>
                {`
                    .nav-link { text-decoration: none; color: #475569; font-weight: 600; font-size: 15px; padding-bottom: 6px; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
                    .nav-link:hover { color: #0ea5e9; border-bottom: 3px solid #bae6fd; }
                    .nav-link.active { color: #0ea5e9; font-weight: 800; border-bottom: 3px solid #0ea5e9; }
                    
                    .dropdown-item { padding: 12px 20px; cursor: pointer; color: #475569; font-size: 14px; display: flex; align-items: center; gap: 10px; transition: all 0.2s; border-left: 3px solid transparent; }
                    .dropdown-item:hover { background-color: #f1f5f9; color: #0ea5e9; }
                    .dropdown-item.active { background-color: #f8fafc; font-weight: bold; color: #0ea5e9; border-left: 3px solid #0ea5e9; padding-left: 17px; }

                    .dropdown-box {
                        position: absolute;
                        background: #fff;
                        border: 1px solid #e2e8f0;
                        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
                        z-index: 100;
                        animation: dropFade 0.2s ease-out forwards;
                    }
                    .dropdown-box::before {
                        content: '';
                        position: absolute;
                        top: -20px;
                        left: 0;
                        width: 100%;
                        height: 20px;
                        background: transparent;
                    }
                    @keyframes dropFade {
                        from { opacity: 0; margin-top: -8px; pointer-events: none; }
                        to { opacity: 1; margin-top: 0; pointer-events: auto; }
                    }
                `}
            </style>

            {/* LOGO */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/student/path')}>
                    <span style={{ fontSize: '28px' }}>🚀</span>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '-0.5px' }}>AiLingo</span>
                </div>
            </div>

            {/* NAV MENU */}
            <nav style={{ display: 'flex', gap: '35px', alignItems: 'center', justifyContent: 'center' }}>
                <Link to="/student/dictionary" className={`nav-link ${isActive('/student/dictionary') ? 'active' : ''}`}>Tra từ vựng</Link>
                
                <div 
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => openMenu('tool')}
                    onMouseLeave={() => closeMenu('tool')}
                >
                    <span className={`nav-link ${isAiToolActive ? 'active' : ''}`} style={{ cursor: 'pointer' }}>Công cụ AI ▾</span>
                    
                    {isToolOpen && (
                        <div className="dropdown-box" style={{ top: '35px', left: '50%', transform: 'translateX(-50%)', width: '220px', padding: '10px 0', borderRadius: '12px' }}>
                            <div className={`dropdown-item ${isActive('/student/ai-practice') ? 'active' : ''}`} onClick={() => navigate('/student/ai-practice')}>🪄 Sửa lỗi Ngữ pháp</div>
                            <div className="dropdown-item">🗣️ Hội thoại Role-play</div>
                            <div className="dropdown-item">🎧 Nghe chép chính tả</div>
                            <div className={`dropdown-item ${isActive('/student/camera-scanner') ? 'active' : ''}`} onClick={() => navigate('/student/camera-scanner')}>📷 Quét Camera Live</div>
                        </div>
                    )}
                </div>

                <Link to={`/student/path?lang=${currentLang}`} className={`nav-link ${isActive('/student/path') ? 'active' : ''}`}>Lộ trình học</Link>
                <Link to="/student/notebook" className={`nav-link ${isActive('/student/notebook') ? 'active' : ''}`}>Sổ tay Từ vựng</Link>
            </nav>

            {/* AVATAR & NGÔN NGỮ */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '25px' }}>
                
                <div 
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => openMenu('lang')}
                    onMouseLeave={() => closeMenu('lang')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', backgroundColor: '#f8fafc', borderRadius: '30px', border: '1px solid #e2e8f0', transition: '0.2s' }}>
                        <span style={{ fontSize: '18px' }}>{getLanguageFlag(currentLang)}</span>
                        <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{getLanguageName(currentLang)}</span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>▼</span>
                    </div>
                    
                    {isLangOpen && (
                        <div className="dropdown-box" style={{ top: '45px', right: '0', width: '180px', padding: '10px 0', borderRadius: '12px' }}>
                            {languages.map(lang => (
                                <div key={lang} className={`dropdown-item ${currentLang === lang ? 'active' : ''}`} onClick={() => { setCurrentLang(lang); setIsLangOpen(false); }}>
                                    <span>{getLanguageFlag(lang)}</span> {getLanguageName(lang)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div 
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => openMenu('user')}
                    onMouseLeave={() => closeMenu('user')}
                >
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#f97316', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)', transition: 'transform 0.2s' }}>
                        {avatarLetter}
                    </div>

                    {isUserMenuOpen && (
                        <div className="dropdown-box" style={{ top: '55px', right: '-10px', width: '240px', padding: '8px 0', borderRadius: '16px' }}>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                                <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '16px' }}>{userInfo.fullName}</div>
                                <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>{userInfo.plan}</div>
                            </div>
                            
                            <div className={`dropdown-item ${isActive('/student/profile') ? 'active' : ''}`} onClick={() => navigate('/student/profile')}>
                                <span style={{ fontSize: '18px' }}>👤</span> Hồ sơ cá nhân
                            </div>
                            <div className="dropdown-item"><span style={{ fontSize: '18px' }}>📊</span> Tiến độ học tập</div>
                            <div className="dropdown-item"><span style={{ fontSize: '18px' }}>⚙️</span> Cài đặt tài khoản</div>
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