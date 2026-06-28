import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function AdminFinance() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal hiển thị Lý do Thất bại / Hoàn tiền
    const [noteModal, setNoteModal] = useState<{ isOpen: boolean, txn: any }>({ isOpen: false, txn: null });

    useEffect(() => {
        const fetchTxns = async () => {
            try {
                const res = await apiClient.get('/admin/transactions/history');
                setTransactions(res.data);
            } catch (error) {
                console.error("Lỗi lấy lịch sử giao dịch", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTxns();
    }, []);

    // Tính tổng doanh thu thành công
    const totalRevenue = transactions
        .filter(t => t.status === 'Success')
        .reduce((sum, t) => sum + t.amount, 0);

    // Tính năng Xuất file CSV báo cáo
    const exportToCSV = () => {
        const headers = ['Ma Giao Dich', 'Khach Hang', 'So Tien (VND)', 'Trang Thai', 'Ngay Giao Dich', 'Ghi Chu'];
        const csvRows = transactions.map(t => [
            t.gatewayTransactionId,
            t.userEmail,
            t.amount,
            t.status === 'Success' ? 'Thành công' : t.status === 'Failed' ? 'Thất bại' : 'Đã hoàn tiền',
            t.createdAt,
            t.note || ''
        ]);

        const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF fix lỗi font tiếng Việt
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `AiLingo_Revenue_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' }}>⏳ Đang tải dữ liệu Kế toán...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <style>{`
                .finance-card { background: #fff; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden; }
                .revenue-banner { background: linear-gradient(135deg, #dcfce3 0%, #ecfdf5 100%); padding: 40px; text-align: center; border-bottom: 2px solid #a7f3d0; }
                
                .finance-table { width: 100%; border-collapse: collapse; }
                .finance-table th { background: #f8fafc; padding: 18px 20px; text-align: left; font-size: 13px; color: #64748b; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; letter-spacing: 0.5px; }
                .finance-table td { padding: 18px 20px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; font-size: 15px; }
                .finance-table tr:hover td { background: #f8fafc; }

                .status-badge { padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 800; display: inline-flex; items-center; gap: 6px; }
                .status-success { background: #dcfce3; color: #166534; }
                .status-failed { background: #fee2e2; color: #b91c1c; }
                .status-refunded { background: #e0e7ff; color: #4338ca; }
                
                .note-btn { background: none; border: none; cursor: pointer; color: #64748b; font-size: 16px; transition: 0.2s; padding: 4px; border-radius: 50%; }
                .note-btn:hover { color: #0f172a; background: #e2e8f0; }

                .btn-export { background: #0f172a; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; gap: 8px; align-items: center; }
                .btn-export:hover { background: #334155; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

                /* MODAL CSS */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: #fff; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 400px; padding: 30px; text-align: center; animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            {/* MODAL XEM GHI CHÚ GIAO DỊCH LỖI */}
            {noteModal.isOpen && noteModal.txn && (
                <div className="modal-overlay" onClick={() => setNoteModal({ isOpen: false, txn: null })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '50px', marginBottom: '15px' }}>{noteModal.txn.status === 'Failed' ? '❌' : '💸'}</div>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
                            {noteModal.txn.status === 'Failed' ? 'Lý do Thất bại' : 'Chi tiết Hoàn tiền'}
                        </h2>
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', color: '#475569', fontSize: '15px', fontWeight: '600', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                            {noteModal.txn.note || "Không có ghi chú từ hệ thống."}
                        </div>
                        <button onClick={() => setNoteModal({ isOpen: false, txn: null })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Đóng lại</button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '36px' }}>💰</span>
                    <div>
                        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>Quản lý Doanh thu</h1>
                        <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '15px' }}>Theo dõi dòng tiền và xuất báo cáo tài chính.</p>
                    </div>
                </div>
                <button className="btn-export" onClick={exportToCSV}>
                    📥 Xuất File CSV
                </button>
            </div>

            <div className="finance-card">
                {/* BANNER TỔNG DOANH THU */}
                <div className="revenue-banner">
                    <div style={{ color: '#166534', fontWeight: '800', fontSize: '16px', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Tổng Doanh Thu Thực Tế (Thành công)</div>
                    <div style={{ fontSize: '50px', fontWeight: '900', color: '#065f46', letterSpacing: '-1px' }}>
                        {totalRevenue.toLocaleString()} VNĐ
                    </div>
                </div>

                {/* BẢNG LỊCH SỬ GIAO DỊCH */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="finance-table">
                        <thead>
                            <tr>
                                <th>Mã Giao Dịch</th>
                                <th>Khách hàng (Email)</th>
                                <th>Ngày GD</th>
                                <th>Số tiền</th>
                                <th>Trạng thái & Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Chưa có giao dịch nào phát sinh.</td></tr>
                            ) : (
                                transactions.map(t => (
                                    <tr key={t.id}>
                                        <td style={{ color: '#3b82f6', fontWeight: '800' }}>{t.gatewayTransactionId}</td>
                                        <td style={{ color: '#475569' }}>{t.userEmail}</td>
                                        <td style={{ color: '#94a3b8', fontSize: '13px' }}>{t.createdAt}</td>
                                        <td style={{ fontWeight: '900', fontSize: '16px', color: t.status === 'Failed' ? '#94a3b8' : '#0f172a', textDecoration: t.status === 'Failed' ? 'line-through' : 'none' }}>
                                            {t.amount.toLocaleString()} đ
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span className={`status-badge ${t.status === 'Success' ? 'status-success' : t.status === 'Failed' ? 'status-failed' : 'status-refunded'}`}>
                                                    {t.status === 'Success' ? '✅ Thành công' : t.status === 'Failed' ? '❌ Thất bại' : '↩️ Đã hoàn tiền'}
                                                </span>
                                                
                                                {/* Nút xem lý do lỗi/hoàn tiền */}
                                                {(t.status === 'Failed' || t.status === 'Refunded') && (
                                                    <button className="note-btn" title="Xem lý do chi tiết" onClick={() => setNoteModal({ isOpen: true, txn: t })}>
                                                        ℹ️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}