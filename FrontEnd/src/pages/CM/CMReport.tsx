import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function CMReport() {
    // ==========================================
    // STATE QUẢN LÝ DỮ LIỆU
    // ==========================================
    const [qualityStats, setQualityStats] = useState({ Total: 0, Approved: 0, Rejected: 0, Pending: 0 });
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // STATE FORM GỬI BÁO CÁO ADMIN
    const [ticketForm, setTicketForm] = useState({ category: 'Tech_Bug', content: '' });

    // TOAST THÔNG BÁO
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    // ==========================================
    // FETCH DỮ LIỆU TỪ BACKEND
    // ==========================================
    const loadReportData = async () => {
        try {
            const [qualityRes, ticketsRes] = await Promise.all([
                apiClient.get('/cm/cm/content-quality'),
                apiClient.get('/cm/cm/my-tickets')
            ]);
            setQualityStats(qualityRes.data);
            setTickets(ticketsRes.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu Report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadReportData(); }, []);

    // ==========================================
    // XỬ LÝ GỬI BÁO CÁO CHO ADMIN
    // ==========================================
    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketForm.content.trim()) { showToast('Vui lòng nhập nội dung cần báo cáo!', 'error'); return; }
        
        try {
            await apiClient.post('/cm/cm/submit-ticket', { issueCategory: ticketForm.category, content: ticketForm.content });
            showToast('✅ Đã gửi Báo cáo thành công cho Admin!', 'success');
            setTicketForm({ category: 'Tech_Bug', content: '' });
            loadReportData(); // Tải lại danh sách ticket ngay lập tức
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Lỗi gửi yêu cầu', 'error');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' }}>⏳ Đang tải dữ liệu Báo cáo...</div>;

    // Tính toán phần trăm cho biểu đồ Thanh ngang (Progress Bar)
    const approvedPercent = qualityStats.Total > 0 ? (qualityStats.Approved / qualityStats.Total) * 100 : 0;
    const rejectedPercent = qualityStats.Total > 0 ? (qualityStats.Rejected / qualityStats.Total) * 100 : 0;
    const pendingPercent = qualityStats.Total > 0 ? (qualityStats.Pending / qualityStats.Total) * 100 : 0;

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <style>{`
                .toast { position: fixed; top: 80px; right: 20px; padding: 16px 24px; border-radius: 12px; color: #fff; font-weight: 800; z-index: 9999; box-shadow: 0 10px 15px rgba(0,0,0,0.1); transition: 0.3s; }
                .toast-show { transform: translateX(0); opacity: 1; }
                .toast-hide { transform: translateX(150%); opacity: 0; }
                
                .report-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                
                .progress-bar-container { width: 100%; height: 24px; background: #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; margin-bottom: 20px; }
                .progress-segment { height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: bold; transition: width 0.5s; }
                
                .btn-submit { background: #0f172a; color: #fff; border: none; padding: 14px; border-radius: 10px; font-weight: bold; fontSize: 16px; cursor: pointer; transition: 0.2s; width: 100%; display: flex; justify-content: center; gap: 8px; }
                .btn-submit:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }

                .input-clean { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-family: Inter; box-sizing: border-box; }
                .input-clean:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            `}</style>

            <div className={`toast ${toast.show ? 'toast-show' : 'toast-hide'}`} style={{ backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
                {toast.msg}
            </div>

            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                <span style={{ fontSize: '36px' }}>📑</span>
                <div>
                    <h1 style={{ color: '#0f172a', margin: 0, fontSize: '30px', fontWeight: '900', letterSpacing: '-0.5px' }}>Báo cáo & Hỗ trợ</h1>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '16px' }}>Đánh giá chất lượng nội dung và gửi yêu cầu cho Ban Quản Trị.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* ============================================== */}
                {/* NỬA TRÁI: BÁO CÁO CHẤT LƯỢNG NỘI DUNG          */}
                {/* ============================================== */}
                <div className="report-card">
                    <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '20px', fontWeight: '900' }}>📊 Chất lượng Giáo trình</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Tỷ lệ xét duyệt bài học của bạn trên toàn hệ thống.</p>
                    
                    {qualityStats.Total === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>Chưa có dữ liệu bài học.</div>
                    ) : (
                        <>
                            {/* Thanh Progress Bar 3 màu */}
                            <div className="progress-bar-container">
                                <div className="progress-segment" style={{ width: `${approvedPercent}%`, background: '#10b981' }}>{approvedPercent > 5 && `${Math.round(approvedPercent)}%`}</div>
                                <div className="progress-segment" style={{ width: `${pendingPercent}%`, background: '#f59e0b' }}>{pendingPercent > 5 && `${Math.round(pendingPercent)}%`}</div>
                                <div className="progress-segment" style={{ width: `${rejectedPercent}%`, background: '#ef4444' }}>{rejectedPercent > 5 && `${Math.round(rejectedPercent)}%`}</div>
                            </div>

                            {/* Chú thích (Legend) */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '30px' }}>
                                <div style={{ padding: '15px', borderRadius: '12px', background: '#dcfce3', border: '1px solid #86efac' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#166534' }}>{qualityStats.Approved}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#15803d' }}>✅ Đã duyệt</div>
                                </div>
                                <div style={{ padding: '15px', borderRadius: '12px', background: '#fef3c7', border: '1px solid #fcd34d' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#b45309' }}>{qualityStats.Pending}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#d97706' }}>⏳ Đang chờ</div>
                                </div>
                                <div style={{ padding: '15px', borderRadius: '12px', background: '#fee2e2', border: '1px solid #fca5a5' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#991b1b' }}>{qualityStats.Rejected}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#b91c1c' }}>❌ Bị từ chối</div>
                                </div>
                            </div>

                            {rejectedPercent > 20 && (
                                <div style={{ marginTop: '20px', padding: '15px', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', fontSize: '14px', fontWeight: '600', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span>⚠️</span> Tỷ lệ bài bị từ chối đang khá cao. Vui lòng kiểm tra lại lỗi chính tả và ngữ pháp trước khi nộp bài.
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ============================================== */}
                {/* NỬA PHẢI: GỬI BÁO CÁO (TICKET) CHO ADMIN       */}
                {/* ============================================== */}
                <div className="report-card">
                    <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '20px', fontWeight: '900' }}>🛠️ Gửi Báo cáo cho Admin</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Yêu cầu cấp quyền, mở khóa hoặc báo lỗi hệ thống.</p>
                    
                    <form onSubmit={handleSubmitTicket}>
                        <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px', fontSize: '14px' }}>Phân loại sự cố</label>
                        <select 
                            className="input-clean"
                            value={ticketForm.category} 
                            onChange={e => setTicketForm({...ticketForm, category: e.target.value})}
                            style={{ marginBottom: '20px', fontWeight: '600' }}
                        >
                            <option value="Tech_Bug">🐛 Lỗi hệ thống / Mất dữ liệu</option>
                            <option value="Permission">🔑 Yêu cầu mở khóa bài học</option>
                            <option value="Other">💡 Ý kiến đóng góp / Khác</option>
                        </select>

                        <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px', fontSize: '14px' }}>Mô tả chi tiết</label>
                        <textarea 
                            className="input-clean"
                            value={ticketForm.content}
                            onChange={e => setTicketForm({...ticketForm, content: e.target.value})}
                            placeholder="Mô tả chi tiết vấn đề để Admin xử lý nhanh nhất..."
                            style={{ minHeight: '120px', marginBottom: '20px', resize: 'none' }}
                        />

                        <button type="submit" className="btn-submit">
                            🚀 Gửi Báo Cáo
                        </button>
                    </form>
                </div>
            </div>

            {/* ============================================== */}
            {/* PHẦN DƯỚI: LỊCH SỬ BÁO CÁO CỦA BẠN             */}
            {/* ============================================== */}
            <div className="report-card" style={{ marginTop: '30px' }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '20px', fontWeight: '900', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🗂️ Lịch sử Báo cáo (Ticket)</span>
                    <span style={{ fontSize: '14px', background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '20px' }}>Tổng: {tickets.length} yêu cầu</span>
                </h2>

                {tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', color: '#94a3b8', borderRadius: '12px' }}>
                        Bạn chưa gửi báo cáo nào cho Ban quản trị.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                        {tickets.map(t => (
                            <div key={t.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', background: '#f8fafc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '14px' }}>
                                        {t.issueCategory === 'Tech_Bug' ? '🐛 Lỗi hệ thống' : t.issueCategory === 'Permission' ? '🔑 Yêu cầu mở khóa' : '💡 Ý kiến khác'}
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: '800', color: t.status === 'Resolved' ? '#10b981' : '#f59e0b', background: t.status === 'Resolved' ? '#dcfce3' : '#fef3c7', padding: '4px 10px', borderRadius: '8px' }}>
                                        {t.status === 'Resolved' ? 'Đã xử lý' : 'Đang chờ Admin'}
                                    </span>
                                </div>
                                <div style={{ color: '#475569', fontSize: '15px', lineHeight: '1.5', marginBottom: '15px' }}>"{t.content}"</div>
                                
                                {t.adminReply && (
                                    <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #3b82f6', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '5px' }}>Ban Quản Trị phản hồi:</strong> 
                                        {t.adminReply}
                                    </div>
                                )}
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '15px', textAlign: 'right', fontWeight: '600' }}>Gửi lúc: {t.createdAt}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}