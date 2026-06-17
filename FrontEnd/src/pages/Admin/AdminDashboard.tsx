import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { getUserId } from '../../utils/auth';

interface User { id: string; email: string; fullName: string; role: string; isBanned: boolean; banReason: string | null; }
interface Ticket { id: string; senderName: string; issueCategory: string; content: string; status: string; }
interface Transaction { id: string; userEmail: string; gatewayTransactionId: string; amount: number; status: string; createdAt: string; }

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'users' | 'tickets' | 'revenue'>('users');
    const adminId = getUserId();

    const [users, setUsers] = useState<User[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [txns, setTxns] = useState<Transaction[]>([]);
    const [adminReplies, setAdminReplies] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        loadUsers();
        loadTickets();
        loadTransactions();
    }, []);

    const loadUsers = async () => {
        const res = await apiClient.get<User[]>('/admin/admin/users');
        setUsers(res.data);
    };

    const loadTickets = async () => {
        const res = await apiClient.get<Ticket[]>('/admin/tickets/all-pending');
        setTickets(res.data);
    };

    const loadTransactions = async () => {
        const res = await apiClient.get<Transaction[]>('/admin/transactions/history');
        setTxns(res.data);
    };

    const handleBanUser = async (userId: string) => {
        const reason = prompt('Nhập lý do khóa tài khoản vi phạm quy định:');
        if (!reason) return;
        await apiClient.put('/admin/admin/ban-violator', { userId, reason });
        alert('Đã khóa tài khoản vĩnh viễn thành công!');
        loadUsers();
    };

    const handleResolveTicket = async (ticketId: string) => {
        const reply = adminReplies[ticketId];
        if (!reply?.trim()) return;

        await apiClient.put('/admin/admin/resolve-support-ticket', { ticketId, adminId, reply });
        alert('Đã đóng khiếu nại và phản hồi tới Email khách hàng!');
        loadTickets();
    };

    // Tính tổng tiền nạp VIP thành công thực tế (Success) từ Database
    const totalRevenue = txns.filter(t => t.status === 'Success').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '25px' }}>
                <button onClick={() => setActiveTab('users')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'users' ? '#dc2626' : '#e2e8f0', color: activeTab === 'users' ? '#fff' : '#475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>👥 Quản lý Thành viên</button>
                <button onClick={() => setActiveTab('tickets')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'tickets' ? '#dc2626' : '#e2e8f0', color: activeTab === 'tickets' ? '#fff' : '#475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🎫 Giải quyết Khiếu nại ({tickets.length})</button>
                <button onClick={() => setActiveTab('revenue')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'revenue' ? '#dc2626' : '#e2e8f0', color: activeTab === 'revenue' ? '#fff' : '#475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💰 Đối soát Doanh thu</button>
            </div>

            {/* TAB 1: QUẢN LÝ USER */}
            {activeTab === 'users' && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{ padding: '10px' }}>Họ tên</th><th style={{ padding: '10px' }}>Email</th><th style={{ padding: '10px' }}>Chức vụ</th><th style={{ padding: '10px' }}>Trạng thái</th><th style={{ padding: '10px' }}>Hành động</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.fullName}</td>
                                <td style={{ padding: '10px' }}>{u.email}</td>
                                <td style={{ padding: '10px' }}>{u.role}</td>
                                <td style={{ padding: '10px' }}>{u.isBanned ? <span style={{ color: 'red', fontWeight: 'bold' }}>🛑 Bị khóa ({u.banReason})</span> : <span style={{ color: 'green' }}>✅ Hoạt động</span>}</td>
                                <td style={{ padding: '10px' }}><button onClick={() => handleBanUser(u.id)} disabled={u.isBanned || u.role === 'Admin'} style={{ background: u.isBanned ? '#cbd5e1' : '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Khóa tài khoản</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* TAB 2: XỬ LÝ KHIẾU NẠI MẤT ACC / LỖI NẠP TIỀN */}
            {activeTab === 'tickets' && (
                <div>
                    <h3>🎫 Danh sách phiếu khiếu nại đang chờ Admin duyệt</h3>
                    {tickets.map(t => (
                        <div key={t.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '15px', background: '#fef2f2' }}>
                            <p style={{ margin: '0 0 5px 0' }}>👤 Khách hàng: <b>{t.senderName}</b> | Phân loại sự cố: <b style={{ color: '#dc2626' }}>{t.issueCategory}</b></p>
                            <p style={{ margin: '0 0 15px 0', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #fee2e2' }}>🚨 <b>Nội dung kiện nghị:</b> {t.content}</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder="Nhập phương án xử lý (VD: Đã kích hoạt VIP bù, đã cấp lại mật khẩu...)" value={adminReplies[t.id] || ''} onChange={e => setAdminReplies({ ...adminReplies, [t.id]: e.target.value })} style={{ flex: 1, padding: '8px' }} />
                                <button onClick={() => handleResolveTicket(t.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Đóng phiếu hỗ trợ</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB 3: ĐỐI SOÁT TÀI CHÍNH (TRANSACTIONS) */}
            {activeTab === 'revenue' && (
                <div>
                    <div style={{ background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
                        <h4 style={{ margin: 0, color: '#94a3b8' }}>💰 TỔNG DOANH THU THỰC TẾ (SUCCESS)</h4>
                        <h2 style={{ margin: '5px 0 0 0', color: '#10b981', fontSize: '36px' }}>{totalRevenue.toLocaleString('vi-VN')} VND</h2>
                    </div>
                    <h4>Lịch sử luồng giao dịch cổng Momo / VNPay / Stripe</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{ padding: '10px' }}>Mã Giao Dịch</th><th style={{ padding: '10px' }}>Tài khoản</th><th style={{ padding: '10px' }}>Số tiền</th><th style={{ padding: '10px' }}>Trạng thái</th></tr></thead>
                        <tbody>
                            {txns.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{t.gatewayTransactionId}</td>
                                    <td style={{ padding: '10px' }}>{t.userEmail}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.amount.toLocaleString('vi-VN')} đ</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ color: t.status === 'Success' ? 'green' : t.status === 'Failed' ? 'red' : 'blue', fontWeight: 'bold' }}>
                                            {t.status === 'Success' ? 'Thành công' : t.status === 'Failed' ? 'Thất bại' : 'Đã hoàn tiền'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}