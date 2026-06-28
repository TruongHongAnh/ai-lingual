import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // CÁC MODAL
    const [banModal, setBanModal] = useState<{ isOpen: boolean, user: any, reason: string }>({ isOpen: false, user: null, reason: '' });
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    
    const openConfirm = (title: string, message: string, onConfirm: () => void) => setConfirmModal({ isOpen: true, title, message, onConfirm });

    // TOAST
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    const loadUsers = async () => {
        try {
            const res = await apiClient.get('/admin/users');
            setUsers(res.data);
        } catch (error) { console.error("Lỗi lấy Users", error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleToggleBan = async (user: any) => {
        if (user.role === 'Admin') { showToast('Không thể khóa Admin!', 'error'); return; }

        if (user.isBanned) {
            openConfirm(
                "Xác nhận Mở khóa",
                `Khôi phục quyền truy cập cho ${user.fullName}?`,
                () => { executeToggleBan(user.id, ""); setConfirmModal(prev => ({ ...prev, isOpen: false })); }
            );
        } else {
            setBanModal({ isOpen: true, user: user, reason: '' });
        }
    };

    const submitBan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!banModal.reason.trim()) { showToast('Nhập lý do khóa!', 'error'); return; }
        executeToggleBan(banModal.user.id, banModal.reason);
        setBanModal({ isOpen: false, user: null, reason: '' });
    };

    const executeToggleBan = async (userId: string, reason: string) => {
        try {
            const res = await apiClient.post(`/admin/users/${userId}/toggle-ban`, { reason });
            showToast(res.data.message, 'success');
            loadUsers(); 
        } catch (error: any) { showToast(error.response?.data?.message || 'Lỗi thao tác!', 'error'); }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold' }}>⏳ Đang tải Danh sách Người dùng...</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .toast { position: fixed; top: 80px; right: 20px; padding: 16px 24px; border-radius: 12px; color: #fff; font-weight: 800; z-index: 9999; box-shadow: 0 10px 15px rgba(0,0,0,0.1); transition: 0.3s; }
                .toast-show { transform: translateX(0); opacity: 1; }
                .toast-hide { transform: translateX(150%); opacity: 0; }
                
                .admin-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .admin-table th { background: #f8fafc; padding: 16px; text-align: left; font-size: 13px; color: #64748b; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
                .admin-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; font-size: 15px; }
                .admin-table tr:hover td { background: #f8fafc; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: #fff; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 450px; animation: slideUp 0.3s ease-out; overflow: hidden; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div className={`toast ${toast.show ? 'toast-show' : 'toast-hide'}`} style={{ backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444' }}>{toast.msg}</div>

            {/* MODAL MỞ KHÓA TÀI KHOẢN */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '50px', marginBottom: '15px' }}>🔓</div>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{confirmModal.title}</h2>
                        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5' }}>{confirmModal.message}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Hủy bỏ</button>
                            <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KHÓA TÀI KHOẢN */}
            {banModal.isOpen && banModal.user && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ background: '#ef4444', padding: '20px', textAlign: 'center', color: '#fff' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>Khóa tài khoản</h2>
                            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>{banModal.user.fullName}</p>
                        </div>
                        <form onSubmit={submitBan} style={{ padding: '25px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Lý do khóa tài khoản? *</label>
                            <input autoFocus type="text" placeholder="Lý do khóa..." value={banModal.reason} onChange={e => setBanModal({...banModal, reason: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box', marginBottom: '20px' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setBanModal({ isOpen: false, user: null, reason: '' })} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Khóa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <span style={{ fontSize: '36px' }}>👥</span>
                <div>
                    <h1 style={{ color: '#0f172a', margin: 0, fontSize: '30px', fontWeight: '900', letterSpacing: '-0.5px' }}>Quản lý Người dùng</h1>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '16px' }}>Xem danh sách và xử lý vi phạm.</p>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Họ Tên</th>
                        <th>Email & Trạng thái</th>
                        <th>Vai trò</th>
                        <th>Tổng XP</th>
                        <th style={{ textAlign: 'center' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: u.role === 'Admin' ? '#fecaca' : '#e0e7ff', color: u.role === 'Admin' ? '#b91c1c' : '#4f46e5', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                                        {u.fullName.charAt(0)}
                                    </div>
                                    <span style={{ color: u.isBanned ? '#94a3b8' : '#0f172a', textDecoration: u.isBanned ? 'line-through' : 'none' }}>{u.fullName}</span>
                                </div>
                            </td>
                            <td style={{ color: '#64748b', fontSize: '14px' }}>
                                <div>{u.email}</div>
                                {u.isBanned && u.banReason && (
                                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>⚠️ Lý do: {u.banReason}</div>
                                )}
                            </td>
                            <td>
                                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: u.role === 'Admin' ? '#fee2e2' : u.role === 'ContentManager' ? '#f3e8ff' : '#f1f5f9', color: u.role === 'Admin' ? '#ef4444' : u.role === 'ContentManager' ? '#7c3aed' : '#475569' }}>
                                    {u.role === 'ContentManager' ? 'CM' : u.role}
                                </span>
                            </td>
                            <td style={{ color: '#f59e0b', fontWeight: '900' }}>{u.xp > 0 ? u.xp.toLocaleString() : '-'}</td>
                            <td style={{ textAlign: 'center' }}>
                                {u.role !== 'Admin' && (
                                    <button 
                                        onClick={() => handleToggleBan(u)}
                                        style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: u.isBanned ? '#f59e0b' : '#fee2e2', color: u.isBanned ? '#fff' : '#ef4444' }}
                                    >
                                        {u.isBanned ? '🔓 Mở khóa' : '🔒 Khóa'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}