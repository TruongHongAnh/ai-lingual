import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    totalXP: number;
    isBanned: boolean;
    banReason: string | null;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, banned: 0 });

    const loadUsers = async () => {
        try {
            // 👉 LẤY DỮ LIỆU THẬT TỪ DATABASE
            const res = await apiClient.get<User[]>('/admin/admin/users');
            setUsers(res.data);
            setStats({
                total: res.data.length,
                active: res.data.filter(u => !u.isBanned).length,
                banned: res.data.filter(u => u.isBanned).length
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // 👉 HÀM KHÓA / MỞ KHÓA KẾT NỐI API THẬT
    const toggleBanStatus = async (userId: string, currentStatus: boolean) => {
        const isBanning = !currentStatus;
        const reason = isBanning ? window.prompt("Nhập lý do khóa tài khoản này:") : "";
        
        if (isBanning && !reason) return; // Hủy khóa nếu không nhập lý do

        if (window.confirm(`Bạn có chắc chắn muốn ${isBanning ? 'Khóa' : 'Mở khóa'} tài khoản này?`)) {
            try {
                if (isBanning) {
                    await apiClient.put('/admin/admin/ban-violator', { userId, reason });
                } else {
                    await apiClient.put('/admin/admin/unban-user', { userId });
                }
                window.alert(`✅ Đã ${isBanning ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
                loadUsers(); // Tải lại danh sách từ Database
            } catch (error: any) {
                window.alert(error.response?.data?.message || "Lỗi xử lý!");
            }
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === 'Admin') return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>Admin</span>;
        if (role === 'ContentManager') return <span style={{ background: '#f3e8ff', color: '#6d28d9', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>ContentManager</span>;
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>User</span>;
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' }}>⏳ Đang tải dữ liệu từ Database...</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ color: '#0f172a', marginBottom: '30px', fontSize: '28px', fontWeight: '900' }}>👥 Quản lý Người dùng</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#dcfce3', border: '1px solid #86efac', padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '40px', fontWeight: '900', color: '#166534' }}>{stats.active}</div>
                    <div style={{ color: '#166534', fontWeight: 'bold', fontSize: '16px' }}>👥 Đang hoạt động</div>
                </div>
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '40px', fontWeight: '900', color: '#991b1b' }}>{stats.banned}</div>
                    <div style={{ color: '#991b1b', fontWeight: 'bold', fontSize: '16px' }}>🚫 Bị khóa</div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '800', fontSize: '14px' }}>Họ tên</th>
                            <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '800', fontSize: '14px' }}>Email</th>
                            <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '800', fontSize: '14px' }}>Role</th>
                            <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '800', fontSize: '14px' }}>XP</th>
                            <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '800', fontSize: '14px' }}>Trạng thái</th>
                            <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '800', fontSize: '14px', textAlign: 'center' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, index) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                                <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#0f172a' }}>{u.fullName}</td>
                                <td style={{ padding: '16px 20px', color: '#475569' }}>{u.email}</td>
                                <td style={{ padding: '16px 20px' }}>{getRoleBadge(u.role)}</td>
                                <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#f59e0b' }}>{u.totalXP.toLocaleString()}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    {!u.isBanned ? (
                                        <div style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>✅ Hoạt động</div>
                                    ) : (
                                        <div>
                                            <div style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>🚫 Khóa</div>
                                            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>Lý do: {u.banReason}</div>
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                    {u.role !== 'Admin' && (
                                        <button 
                                            onClick={() => toggleBanStatus(u.id, u.isBanned)}
                                            style={{ background: u.isBanned ? '#10b981' : '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '90px' }}
                                        >
                                            {u.isBanned ? 'Mở Khóa' : 'Khóa'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}