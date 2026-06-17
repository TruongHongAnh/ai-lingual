import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

// Định nghĩa kiểu dữ liệu cho phản hồi từ API đăng nhập
interface LoginResponse {
    token: string;
    name: string;
    role: string;
    isPremium: boolean;
}

export default function Login() {
    const [email, setEmail] = useState<string>('vipuser@gmail.com'); // Mặc định tài khoản test đã seed
    const [password, setPassword] = useState<string>('hash_123');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await apiClient.post<LoginResponse>('/public/auth/login', { email, password });
            const { token, name, role } = response.data;

            // Lưu trữ thông tin định danh vào LocalStorage
            localStorage.setItem('token', token);
            localStorage.setItem('fullName', name);
            localStorage.setItem('role', role);

            // Điều hướng thông minh dựa trên quyền hạn (Role-based Routing)
            if (role === 'Admin') {
                navigate('/admin');
            } else if (role === 'ContentManager') {
                navigate('/cm');
            } else {
                navigate('/student/ai-practice');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#0f172a' }}>🚀 Đăng Nhập AI Lingo</h2>
                
                {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email hệ thống</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Mật khẩu</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}