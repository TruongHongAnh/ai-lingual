import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface LoginResponse {
    token: string;
    fullName: string;
    role: string;
    userId: string;
    isPremium: boolean;
}

// 👉 ĐÃ CẬP NHẬT: Danh sách 5 tài khoản test bao quát toàn bộ hệ thống
const TEST_ACCOUNTS = [
    { email: 'vipuser@gmail.com', password: '123456', role: '👨‍🎓 Học viên VIP', description: 'Test lộ trình học & BCrypt' },
    { email: 'normal@gmail.com', password: 'hash_123', role: '👨‍🎓 Học viên Cày chay', description: 'Test tài khoản thường' },
    { email: 'admin@ailingo.vn', password: 'hash_123', role: '👨‍💼 Quản trị viên', description: 'Test chuyển hướng Admin' },
    { email: 'cm1@ailingo.vn', password: 'hash_123', role: '✏️ Biên tập viên', description: 'Test chuyển hướng CM' },
    { email: 'spammer@gmail.com', password: 'hash_123', role: '⛔ Tài khoản bị Khóa', description: 'Test thông báo Ban' },
];

export default function Login() {
    const [email, setEmail] = useState<string>('vipuser@gmail.com');
    const [password, setPassword] = useState<string>('123456');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<string>('');
    const [showTestAccounts, setShowTestAccounts] = useState<boolean>(false);
    
    // States cho Modal Quên mật khẩu
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>('');
    const [forgotPasswordError, setForgotPasswordError] = useState<string>('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState<boolean>(false);
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string>('');
    
    const navigate = useNavigate();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotPasswordError('');
        setForgotPasswordSuccess('');

        if (!forgotPasswordEmail.trim()) {
            setForgotPasswordError('Vui lòng nhập email');
            return;
        }
        if (!validateEmail(forgotPasswordEmail)) {
            setForgotPasswordError('Email không hợp lệ');
            return;
        }

        setForgotPasswordLoading(true);
        
        try {
            const response = await apiClient.post('/public/auth/forgot-password', { email: forgotPasswordEmail.trim() });
            setForgotPasswordSuccess(response.data.message || '✅ Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn');
            setForgotPasswordEmail('');
            setTimeout(() => {
                setShowForgotPasswordModal(false);
                setForgotPasswordSuccess('');
            }, 2500);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Gửi yêu cầu thất bại';
            if (err.response?.status === 404) {
                setForgotPasswordError('❌ Email này chưa được đăng ký trong hệ thống');
            } else {
                setForgotPasswordError(`❌ ${errorMsg}`);
            }
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setEmailError(''); setSuccess('');

        if (!email.trim()) { setEmailError('Vui lòng nhập email'); return; }
        if (!validateEmail(email)) { setEmailError('Email không hợp lệ'); return; }
        if (!password.trim()) { setError('Vui lòng nhập mật khẩu'); return; }
        if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }

        setLoading(true);
        
        try {
            const response = await apiClient.post<LoginResponse>('/public/auth/login', { email, password });
            const { token, fullName, role, userId } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('fullName', fullName);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId);

            setSuccess(`✅ Đăng nhập thành công! Chào ${fullName}. Đang chuyển hướng...`);
            
            setTimeout(() => {
                if (role === 'Admin') navigate('/admin/dashboard');
                else if (role === 'ContentManager') navigate('/cm/dashboard');
                else navigate('/student/dashboard');
            }, 1000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại!';
            if (err.response?.status === 401) {
                setError('❌ Email hoặc mật khẩu không chính xác. Hoặc tài khoản đã bị khóa.');
            } else if (err.response?.status === 404) {
                setError('❌ Tài khoản không tồn tại.');
            } else if (err.response?.status === 429) {
                setError('❌ Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.');
            } else {
                setError(`❌ ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadTestAccount = (testEmail: string, testPassword: string) => {
        setEmail(testEmail);
        setPassword(testPassword);
        setError(''); setSuccess(''); setEmailError('');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#faf9f5', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            
            {/* HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#faf9f5', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '28px' }}>🚀</span>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '-0.5px' }}>AiLingo</span>
                </div>

                <nav style={{ display: 'flex', gap: '30px' }}>
                    <span style={{ color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Tra từ vựng</span>
                    <span style={{ color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Công cụ AI ▾</span>
                    <span style={{ color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Lộ trình ▾</span>
                    <span style={{ color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Cộng đồng</span>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>🔍</span>
                    <button style={{ background: 'transparent', color: '#1e293b', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Đăng nhập</button>
                    <button onClick={() => navigate('/signup')} style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Đăng ký</button>
                </div>
            </header>

            {/* MAIN LOGIN AREA */}
            <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
                <div style={{ display: 'flex', width: '100%', maxWidth: '900px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    
                    {/* BÊN TRÁI: INFO & TEST ACCOUNTS */}
                    <div style={{ flex: 1, backgroundColor: '#0f172a', padding: '50px 40px', color: '#fff', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '28px', marginBottom: '30px', fontWeight: '800' }}>Tính năng của AiLingo</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', flex: 1 }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <span style={{ fontSize: '22px', flexShrink: 0 }}>📚</span>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#f8fafc' }}>Thư viện Đa ngôn ngữ</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>Tra cứu chuẩn IELTS, TOEIC, JLPT N5-N1 và HSK.</p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <span style={{ fontSize: '22px', flexShrink: 0 }}>🪄</span>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#f8fafc' }}>Trợ lý AI Thông minh</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>Phân tích ngữ pháp, chấm điểm IELTS Writing tự động.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <span style={{ fontSize: '22px', flexShrink: 0 }}>🗣️</span>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#f8fafc' }}>Hội thoại Role-play</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>Luyện phản xạ giao tiếp với Bot AI bằng giọng bản xứ.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <span style={{ fontSize: '22px', flexShrink: 0 }}>🗂️</span>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#f8fafc' }}>Sổ tay Spaced-Repetition</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>Ghi nhớ từ vựng vĩnh viễn nhờ thuật toán khoa học.</p>
                                </div>
                            </div>
                        </div>

                        {/* PANEL CHỌN TÀI KHOẢN TEST */}
                        <div style={{ marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid #334155' }}>
                            <button
                                type="button"
                                onClick={() => setShowTestAccounts(!showTestAccounts)}
                                style={{ background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 15px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', width: '100%', transition: '0.2s' }}
                            >
                                {showTestAccounts ? '▼ Ẩn tài khoản test (5)' : '▶ Hiện tài khoản test (5)'}
                            </button>
                            {showTestAccounts && (
                                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {TEST_ACCOUNTS.map((acc, idx) => (
                                        <button
                                            key={idx} type="button"
                                            onClick={() => loadTestAccount(acc.email, acc.password)}
                                            style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', textAlign: 'left', transition: '0.2s' }}
                                        >
                                            <div style={{ fontWeight: '600', color: acc.role.includes('Khóa') ? '#fca5a5' : '#cbd5e1' }}>
                                                {acc.role} - {acc.description}
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{acc.email}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BÊN PHẢI: FORM ĐĂNG NHẬP */}
                    <div style={{ flex: 1, padding: '50px 40px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '800' }}>Đăng nhập AiLingo</h2>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Chào mừng bạn trở lại!</p>
                        </div>

                        <button type="button" style={{ width: '100%', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', fontWeight: '600', color: '#334155', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px', transition: '0.2s', opacity: loading ? 0.6 : 1 }} disabled={loading}>
                            <span style={{ fontSize: '18px' }}>🌐</span> Đăng nhập với Google
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                            <span style={{ padding: '0 10px', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>HOẶC ĐĂNG NHẬP VỚI EMAIL</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                        </div>

                        {success && <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', border: '1px solid #a7f3d0', textAlign: 'center', fontWeight: '500' }}>{success}</div>}
                        {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', border: '1px solid #fca5a5' }}>{error}</div>}
                        
                        <form onSubmit={handleLogin} style={{ flex: 1 }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                                    disabled={loading} required placeholder="name@example.com"
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: emailError ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: loading ? '#f1f5f9' : '#fff', cursor: loading ? 'not-allowed' : 'text', transition: '0.2s' }} 
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = emailError ? '#ef4444' : '#cbd5e1'; }}
                                />
                                {emailError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{emailError}</p>}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Mật khẩu <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                                    disabled={loading} required placeholder="Nhập mật khẩu của bạn"
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: loading ? '#f1f5f9' : '#fff', cursor: loading ? 'not-allowed' : 'text', transition: '0.2s' }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                />
                                <button type="button" onClick={() => setShowForgotPasswordModal(true)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: '600', marginTop: '8px', textDecoration: 'underline', padding: 0 }}>
                                    Quên mật khẩu?
                                </button>
                            </div>

                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.2s', opacity: loading ? 0.7 : 1 }}>
                                {loading ? '⏳ Đang xác thực...' : '✅ Đăng nhập'}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '30px', color: '#64748b', fontSize: '12px', lineHeight: '1.6' }}>
                            Bằng cách đăng nhập, bạn đồng ý với <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Điều khoản sử dụng</span> và <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Chính sách bảo mật</span> của chúng tôi.
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                            Chưa có tài khoản? <span style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Đăng ký ngay</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL QUÊN MẬT KHẨU */}
            {showForgotPasswordModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: '20px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>Khôi phục mật khẩu</h3>
                        <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>Vui lòng nhập Email bạn đã đăng ký. Chúng tôi sẽ gửi một liên kết an toàn để bạn đặt lại mật khẩu mới.</p>
                        
                        {forgotPasswordSuccess ? (
                            <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '16px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', border: '1px solid #a7f3d0', marginBottom: '20px', fontWeight: '500' }}>
                                {forgotPasswordSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword}>
                                {forgotPasswordError && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', border: '1px solid #fca5a5' }}>{forgotPasswordError}</div>}
                                
                                <input 
                                    type="email" 
                                    value={forgotPasswordEmail} 
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                                    placeholder="Nhập email của bạn..."
                                    required
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', marginBottom: '20px', outlineColor: '#3b82f6', backgroundColor: '#f8fafc' }}
                                />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => { setShowForgotPasswordModal(false); setForgotPasswordError(''); setForgotPasswordEmail(''); }} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Hủy</button>
                                    <button type="submit" disabled={forgotPasswordLoading} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: forgotPasswordLoading ? 'not-allowed' : 'pointer', opacity: forgotPasswordLoading ? 0.7 : 1, transition: '0.2s' }}>
                                        {forgotPasswordLoading ? '⏳ Đang gửi...' : 'Gửi mã xác nhận'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            
            {/* NÚT GÓP Ý TRÔI NỔI */}
            <button style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 999, transition: '0.2s' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
            >
                💬 Góp ý
            </button>
        </div>
    );
}