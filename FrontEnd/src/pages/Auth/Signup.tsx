import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface SignupResponse {
    message: string;
}

const SIGNUP_STEPS = [
    { step: 1, title: 'Email', description: 'Nhập email để bắt đầu' },
    { step: 2, title: 'Mật khẩu', description: 'Tạo mật khẩu an toàn' },
    { step: 3, title: 'Thông tin', description: 'Hoàn tất hồ sơ' },
    { step: 4, title: 'Xác nhận', description: 'Xác minh email' },
];

export default function Signup() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string>('');
    const [passwordStrength, setPasswordStrength] = useState<number>(0);
    const navigate = useNavigate();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (pwd: string): { score: number; message: string } => {
        let score = 0;
        const issues = [];

        if (pwd.length >= 8) score += 25;
        else issues.push('Ít nhất 8 ký tự');

        if (/[A-Z]/.test(pwd)) score += 25;
        else issues.push('Có chữ hoa (A-Z)');

        if (/[0-9]/.test(pwd)) score += 25;
        else issues.push('Có số (0-9)');

        if (/[!@#$%^&*]/.test(pwd)) score += 25;
        else issues.push('Có ký tự đặc biệt (!@#$%^&*)');

        return { score, message: issues.length > 0 ? issues.join(', ') : '✅ Mật khẩu mạnh' };
    };

    const validateFullName = (name: string): boolean => {
        return name.trim().length >= 3 && name.trim().length <= 100;
    };

    const handleNextStep = (step: number) => {
        const newErrors: { [key: string]: string } = {};

        if (step === 2) {
            // Validate email
            if (!email.trim()) {
                newErrors['email'] = 'Vui lòng nhập email';
            } else if (!validateEmail(email)) {
                newErrors['email'] = 'Email không hợp lệ';
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
            setErrors({});
            setCurrentStep(2);
        } else if (step === 3) {
            // Validate password
            if (!password.trim()) {
                newErrors['password'] = 'Vui lòng nhập mật khẩu';
            } else if (password.length < 6) {
                newErrors['password'] = 'Mật khẩu phải có ít nhất 6 ký tự';
            }

            if (!confirmPassword.trim()) {
                newErrors['confirmPassword'] = 'Vui lòng xác nhận mật khẩu';
            } else if (password !== confirmPassword) {
                newErrors['confirmPassword'] = 'Mật khẩu không khớp';
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
            setErrors({});
            setCurrentStep(3);
        } else if (step === 4) {
            // Validate full name
            if (!validateFullName(fullName)) {
                newErrors['fullName'] = 'Tên phải từ 3-100 ký tự';
                setErrors(newErrors);
                return;
            }
            setErrors({});
            setCurrentStep(4);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({});
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setErrors({});

        try {
            const response = await apiClient.post<SignupResponse>('/public/auth/register', {
                email: email.trim(),
                password: password.trim(),
                fullName: fullName.trim(),
            });

            setSuccess('✅ ' + response.data.message);
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Đăng ký thất bại!';
            if (err.response?.status === 400) {
                if (errorMsg.includes('Email')) {
                    setErrors({ email: '❌ Email này đã được sử dụng' });
                } else if (errorMsg.includes('mật khẩu')) {
                    setErrors({ password: '❌ ' + errorMsg });
                } else {
                    setErrors({ general: '❌ ' + errorMsg });
                }
            } else if (err.response?.status === 409) {
                setErrors({ email: '❌ Email đã tồn tại trong hệ thống' });
            } else {
                setErrors({ general: '❌ Lỗi hệ thống, vui lòng thử lại sau.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (pwd: string) => {
        setPassword(pwd);
        const validation = validatePassword(pwd);
        setPasswordStrength(validation.score);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#faf9f5', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            
            {/* HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#faf9f5', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', onClick: () => navigate('/') }}>
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
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#1e293b', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Đăng nhập</button>
                    <button style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Đăng ký</button>
                </div>
            </header>

            {/* MAIN SIGNUP AREA */}
            <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', maxWidth: '500px' }}>
                    
                    {/* PROGRESS INDICATOR */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            {SIGNUP_STEPS.map((s, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        marginBottom: '8px',
                                        backgroundColor: s.step < currentStep ? '#10b981' : s.step === currentStep ? '#3b82f6' : '#e2e8f0',
                                        color: s.step <= currentStep ? '#fff' : '#64748b',
                                        transition: '0.3s'
                                    }}>
                                        {s.step < currentStep ? '✓' : s.step}
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>{s.title}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: '2px', backgroundColor: '#e2e8f0', position: 'relative', borderRadius: '1px' }}>
                            <div style={{
                                height: '100%',
                                backgroundColor: '#3b82f6',
                                width: `${(currentStep - 1) * 33.33}%`,
                                transition: '0.3s',
                                borderRadius: '1px'
                            }}></div>
                        </div>
                    </div>

                    {/* CARD */}
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px -5px rgba(0,0,0,0.1)',
                        padding: '50px 40px'
                    }}>

                        {/* ERROR MESSAGES */}
                        {errors.general && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                color: '#991b1b',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '20px',
                                fontSize: '13px',
                                border: '1px solid #fca5a5'
                            }}>
                                {errors.general}
                            </div>
                        )}

                        {/* SUCCESS MESSAGE */}
                        {success && (
                            <div style={{
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '20px',
                                fontSize: '13px',
                                border: '1px solid #a7f3d0',
                                textAlign: 'center',
                                fontWeight: '500'
                            }}>
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSignup}>
                            {/* STEP 1: EMAIL */}
                            {currentStep >= 1 && currentStep <= 1 && (
                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                    <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '800' }}>Đăng ký AiLingo</h2>
                                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 30px 0' }}>Bước 1: Nhập email của bạn</p>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                            Email <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => {
                                                setEmail(e.target.value);
                                                if (errors.email) setErrors({ ...errors, email: '' });
                                            }}
                                            disabled={loading}
                                            placeholder="name@example.com"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                border: errors.email ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                                fontSize: '15px',
                                                boxSizing: 'border-box',
                                                outline: 'none',
                                                backgroundColor: loading ? '#f1f5f9' : '#fff',
                                                transition: '0.2s'
                                            }}
                                            onFocus={(e) => !errors.email && (e.currentTarget.style.borderColor = '#3b82f6')}
                                            onBlur={(e) => e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#cbd5e1'}
                                        />
                                        {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.email}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PASSWORD */}
                            {currentStep === 2 && (
                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                    <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '800' }}>Tạo mật khẩu</h2>
                                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 30px 0' }}>Bước 2: Mật khẩu an toàn giúp bảo vệ tài khoản của bạn</p>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                            Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => {
                                                handlePasswordChange(e.target.value);
                                                if (errors.password) setErrors({ ...errors, password: '' });
                                            }}
                                            disabled={loading}
                                            placeholder="Nhập mật khẩu"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                border: errors.password ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                                fontSize: '15px',
                                                boxSizing: 'border-box',
                                                outline: 'none',
                                                transition: '0.2s'
                                            }}
                                            onFocus={(e) => !errors.password && (e.currentTarget.style.borderColor = '#3b82f6')}
                                            onBlur={(e) => e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#cbd5e1'}
                                        />
                                        {errors.password && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.password}</p>}

                                        {password && (
                                            <div style={{ marginTop: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <div style={{
                                                        flex: 1,
                                                        height: '4px',
                                                        backgroundColor: '#e2e8f0',
                                                        borderRadius: '2px',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${passwordStrength}%`,
                                                            backgroundColor: passwordStrength < 50 ? '#ef4444' : passwordStrength < 75 ? '#f59e0b' : '#10b981',
                                                            borderRadius: '2px',
                                                            transition: '0.3s'
                                                        }}></div>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: passwordStrength < 50 ? '#ef4444' : passwordStrength < 75 ? '#f59e0b' : '#10b981'
                                                    }}>
                                                        {passwordStrength < 50 ? 'Yếu' : passwordStrength < 75 ? 'Trung bình' : 'Mạnh'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                            Xác nhận mật khẩu <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => {
                                                setConfirmPassword(e.target.value);
                                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                            }}
                                            disabled={loading}
                                            placeholder="Nhập lại mật khẩu"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                border: errors.confirmPassword ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                                fontSize: '15px',
                                                boxSizing: 'border-box',
                                                outline: 'none',
                                                transition: '0.2s'
                                            }}
                                            onFocus={(e) => !errors.confirmPassword && (e.currentTarget.style.borderColor = '#3b82f6')}
                                            onBlur={(e) => e.currentTarget.style.borderColor = errors.confirmPassword ? '#ef4444' : '#cbd5e1'}
                                        />
                                        {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: FULL NAME */}
                            {currentStep === 3 && (
                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                    <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '800' }}>Tên của bạn</h2>
                                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 30px 0' }}>Bước 3: Giúp chúng tôi biết tên bạn</p>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                            Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => {
                                                setFullName(e.target.value);
                                                if (errors.fullName) setErrors({ ...errors, fullName: '' });
                                            }}
                                            disabled={loading}
                                            placeholder="Ví dụ: Nguyễn Văn A"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                border: errors.fullName ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                                fontSize: '15px',
                                                boxSizing: 'border-box',
                                                outline: 'none',
                                                transition: '0.2s'
                                            }}
                                            onFocus={(e) => !errors.fullName && (e.currentTarget.style.borderColor = '#3b82f6')}
                                            onBlur={(e) => e.currentTarget.style.borderColor = errors.fullName ? '#ef4444' : '#cbd5e1'}
                                        />
                                        {errors.fullName && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.fullName}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: REVIEW & CONFIRM */}
                            {currentStep === 4 && (
                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                    <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '800' }}>Xác nhận thông tin</h2>
                                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 30px 0' }}>Bước 4: Kiểm tra lại thông tin của bạn</p>

                                    <div style={{
                                        backgroundColor: '#f8fafc',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '0 0 4px 0' }}>EMAIL</p>
                                            <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500', margin: 0 }}>{email}</p>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '0 0 4px 0' }}>HỌ VÀ TÊN</p>
                                            <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500', margin: 0 }}>{fullName}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '0 0 4px 0' }}>LOẠI TÀI KHOẢN</p>
                                            <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500', margin: 0 }}>👨‍🎓 Học viên (Miễn phí)</p>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', color: '#065f46', border: '1px solid #a7f3d0' }}>
                                        ✅ Sau khi đăng ký, bạn sẽ nhận được email xác nhận. Vui lòng kiểm tra hộp thư của bạn.
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', fontSize: '13px', color: '#64748b' }}>
                                        <input type="checkbox" id="terms" style={{ cursor: 'pointer' }} />
                                        <label htmlFor="terms" style={{ cursor: 'pointer' }}>
                                            Tôi đồng ý với <span style={{ color: '#2563eb', textDecoration: 'underline' }}>Điều khoản sử dụng</span> và <span style={{ color: '#2563eb', textDecoration: 'underline' }}>Chính sách bảo mật</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* BUTTONS */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        disabled={loading}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: '#f1f5f9',
                                            color: '#334155',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            fontSize: '15px',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: '0.2s',
                                            opacity: loading ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                                    >
                                        ← Quay lại
                                    </button>
                                )}

                                <button
                                    type={currentStep === 4 ? 'submit' : 'button'}
                                    onClick={() => {
                                        if (currentStep < 4) {
                                            handleNextStep(currentStep + 1);
                                        }
                                    }}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: loading ? '#94a3b8' : '#1e293b',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        fontSize: '15px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: '0.2s',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#0f172a';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
                                    }}
                                >
                                    {currentStep === 4 ? (loading ? '⏳ Đang đăng ký...' : '✅ Hoàn tất đăng ký') : 'Tiếp tục →'}
                                </button>
                            </div>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                            Đã có tài khoản? <span style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>Đăng nhập ngay</span>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
