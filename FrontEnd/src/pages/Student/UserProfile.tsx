import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function UserProfile() {
    const [user, setUser] = useState({
        fullName: '', email: '', phone: '', dob: '', bio: '',
        paymentMethod: 'Tài khoản PayPal đã liên kết',
        plan: 'Đang tải...', joinDate: 'Tháng 1, 2026'
    });

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    // Hàm format phân quyền chung
    const getPlanText = (role: string, isPremium: boolean, langCode: string) => {
        if (role === 'ContentManager') {
            if (langCode === 'en') return 'Biên tập viên Tiếng Anh 🇬🇧';
            if (langCode === 'ja') return 'Biên tập viên Tiếng Nhật 🇯🇵';
            if (langCode === 'zh') return 'Biên tập viên Tiếng Trung 🇨🇳';
            if (langCode === 'all') return 'Trưởng nhóm Nội dung 🌐';
            return 'Biên tập viên Nội dung 📝';
        }
        if (role === 'Admin') return 'Trùm Quản Trị 👑';
        return isPremium ? 'Học viên Premium ✨' : 'Học viên Tiêu chuẩn 🥉';
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/user/student/profile');
                setUser(prev => ({ 
                    ...prev, 
                    ...response.data,
                    // 👉 TỰ ĐỘNG PHÂN TÍCH CHỨC DANH DỰA VÀO DỮ LIỆU TỪ DATABASE
                    plan: getPlanText(response.data.role, response.data.isPremium, response.data.managedLanguage)
                }));
            } catch (error) {
                console.error("Lỗi lấy thông tin hồ sơ:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveInfo = async () => {
        try {
            await apiClient.put('/user/student/profile', { fullName: user.fullName, phone: user.phone, dob: user.dob, bio: user.bio });
            setIsEditingInfo(false);
            showToast("Đã lưu thông tin cá nhân thành công!", "success");
        } catch (error) { showToast("Lỗi khi lưu thông tin. Vui lòng thử lại.", "error"); }
    };

    const handleSaveBio = async () => {
        try {
            await apiClient.put('/user/student/profile', { fullName: user.fullName, phone: user.phone, dob: user.dob, bio: user.bio });
            setIsEditingBio(false);
            showToast("Đã cập nhật mục tiêu học tập!", "success");
        } catch (error) { showToast("Lỗi khi lưu mục tiêu.", "error"); }
    };

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) { showToast("Mật khẩu xác nhận không khớp!", "error"); return; }
        if (passwords.new.length < 6) { showToast("Mật khẩu mới phải từ 6 ký tự!", "error"); return; }
        try {
            await apiClient.post('/user/student/profile/change-password', { oldPassword: passwords.old, newPassword: passwords.new });
            showToast("Đổi mật khẩu thành công!", "success");
            setIsPasswordModalOpen(false);
            setPasswords({ old: '', new: '', confirm: '' });
        } catch (err: any) {
            showToast(err.response?.data?.message || "Đổi mật khẩu thất bại!", "error");
        }
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' }}>⏳ Đang tải hồ sơ từ Database...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            <style>
                {`
                    .toast { position: fixed; top: 20px; right: 20px; padding: 16px 24px; border-radius: 16px; color: #fff; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 10px; z-index: 9999; box-shadow: 0 10px 25px rgba(0,0,0,0.1); transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s; }
                    .toast-hidden { transform: translateX(150%); opacity: 0; }
                    .toast-visible { transform: translateX(0); opacity: 1; }
                `}
            </style>

            <div className={`toast ${toast.show ? 'toast-visible' : 'toast-hidden'}`} style={{ backgroundColor: toast.type === 'success' ? '#58cc02' : '#ff4b4b' }}>
                {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', padding: '30px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f97316', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '50px', fontWeight: 'bold', border: '6px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#0f172a', fontWeight: '900' }}>
                        {user.fullName || 'Chưa cập nhật tên'}
                    </h1>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ padding: '6px 16px', backgroundColor: '#dcfce3', color: '#166534', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>{user.plan}</span>
                        <span style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>Thành viên từ {user.joinDate}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b', fontWeight: '800' }}>Hồ sơ cá nhân</h2>
                            <button 
                                onClick={() => isEditingInfo ? handleSaveInfo() : setIsEditingInfo(true)}
                                style={{ padding: '8px 20px', backgroundColor: isEditingInfo ? '#10b981' : '#f1f5f9', color: isEditingInfo ? '#fff' : '#3b82f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                            >
                                {isEditingInfo ? '💾 Lưu thay đổi' : '✏️ Chỉnh sửa'}
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <InputField label="Họ và Tên" value={user.fullName} isEditing={isEditingInfo} onChange={(e: any) => setUser({...user, fullName: e.target.value})} />
                            <InputField label="Email (Không thể đổi)" value={user.email} isEditing={false} onChange={() => {}} />
                            <InputField label="Số điện thoại" value={user.phone} isEditing={isEditingInfo} onChange={(e: any) => setUser({...user, phone: e.target.value})} />
                            <InputField label="Ngày sinh" type="date" value={user.dob} isEditing={isEditingInfo} onChange={(e: any) => setUser({...user, dob: e.target.value})} />
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '6px solid #3b82f6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b', fontWeight: '800' }}>🎯 Mục tiêu học tập & Định hướng</h2>
                            <button 
                                onClick={() => isEditingBio ? handleSaveBio() : setIsEditingBio(true)}
                                style={{ padding: '8px 20px', backgroundColor: isEditingBio ? '#3b82f6' : '#f1f5f9', color: isEditingBio ? '#fff' : '#3b82f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                            >
                                {isEditingBio ? '💾 Lưu Mục tiêu' : '✏️ Cập nhật'}
                            </button>
                        </div>
                        {isEditingBio ? (
                            <textarea value={user.bio} onChange={(e) => setUser({...user, bio: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', minHeight: '100px', outline: 'none', fontFamily: 'Inter', fontSize: '15px', boxSizing: 'border-box' }} />
                        ) : (
                            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#334155', minHeight: '100px', fontSize: '15px', lineHeight: '1.6', border: '2px solid transparent' }}>{user.bio || 'Hãy viết vài dòng giới thiệu về bản thân...'}</div>
                        )}
                    </div>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b', fontWeight: '800' }}>💳 Thanh toán</h3>
                        <div style={{ padding: '15px', border: '2px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#003087', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold' }}>P</div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{user.paymentMethod}</div>
                                <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '600', marginTop: '4px' }}>Đang kích hoạt</div>
                            </div>
                        </div>
                        <button style={{ width: '100%', padding: '12px', marginTop: '15px', backgroundColor: '#fff', border: '2px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>+ Đổi phương thức</button>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b', fontWeight: '800' }}>🔒 Bảo mật</h3>
                        <button 
                            onClick={() => setIsPasswordModalOpen(true)}
                            style={{ width: '100%', padding: '12px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Đổi mật khẩu
                        </button>
                    </div>
                </div>
            </div>

            {isPasswordModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ margin: '0 0 25px 0', color: '#0f172a', fontSize: '22px', fontWeight: '900', textAlign: 'center' }}>Đổi mật khẩu</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>Mật khẩu hiện tại</label>
                                <input type="password" placeholder="Nhập mật khẩu hiện tại" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>Mật khẩu mới</label>
                                <input type="password" placeholder="Nhập mật khẩu mới" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>Xác nhận mật khẩu mới</label>
                                <input type="password" placeholder="Nhập lại mật khẩu mới" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        <button onClick={handleChangePassword} style={{ width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginBottom: '10px' }}>
                            Cập nhật Mật khẩu
                        </button>
                        <button onClick={() => { setIsPasswordModalOpen(false); setPasswords({old: '', new: '', confirm: ''}); }} style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', color: '#64748b', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const InputField = ({ label, value, type = 'text', isEditing, onChange }: any) => (
    <div>
        <label style={{ display: 'block', fontSize: '14px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>{label}</label>
        {isEditing ? (
            <input type={type} value={value} onChange={onChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '15px', color: '#0f172a', boxSizing: 'border-box' }} />
        ) : (
            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#334155', fontSize: '15px', border: '2px solid transparent', minHeight: '44px', boxSizing: 'border-box' }}>{value}</div>
        )}
    </div>
);