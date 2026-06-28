import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { getUserId } from '../../utils/auth';

export default function AdminTickets() {
    const adminId = getUserId();
    const [tickets, setTickets] = useState<any[]>([]);
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);

    // STATE CHO MODAL XÁC NHẬN
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ 
        isOpen: false, title: '', message: '', onConfirm: () => {} 
    });

    const openConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

    // TOAST THÔNG BÁO
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    useEffect(() => { loadTickets(); }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/tickets/all-pending');
            setTickets(res.data);
        } catch (e) { 
            console.error(e); 
        } finally {
            setLoading(false);
        }
    };

    // BƯỚC 1: KIỂM TRA INPUT VÀ MỞ MODAL XÁC NHẬN
    const handleResolveClick = (ticketId: string) => {
        const reply = replyText[ticketId];
        
        if (!reply || !reply.trim()) {
            showToast("Vui lòng nhập phản hồi cho khách hàng trước khi đóng!", "error");
            return;
        }

        openConfirm(
            "Xác nhận đóng Ticket?",
            "Bạn có chắc chắn muốn gửi phản hồi này và đóng khiếu nại? Hành động này không thể hoàn tác.",
            () => executeResolve(ticketId, reply)
        );
    };

    // BƯỚC 2: GỌI API THỰC SỰ SAU KHI ĐÃ BẤM "XÁC NHẬN"
    const executeResolve = async (ticketId: string, reply: string) => {
        try {
            // Sử dụng đường dẫn API chuẩn đã fix
            await apiClient.put('/admin/tickets/resolve', { ticketId, adminId, reply });
            showToast('✅ Đã xử lý và đóng khiếu nại thành công!', 'success');
            
            setReplyText(prev => ({ ...prev, [ticketId]: '' }));
            setConfirmModal(prev => ({ ...prev, isOpen: false })); // Đóng modal
            loadTickets(); 
        } catch (e) { 
            showToast("Lỗi xử lý. Vui lòng thử lại!", "error"); 
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' }}>⏳ Đang tải danh sách khiếu nại...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <style>{`
                .toast { position: fixed; top: 80px; right: 20px; padding: 16px 24px; border-radius: 12px; color: #fff; font-weight: 800; z-index: 9999; box-shadow: 0 10px 15px rgba(0,0,0,0.1); transition: 0.3s; }
                .toast-show { transform: translateX(0); opacity: 1; }
                .toast-hide { transform: translateX(150%); opacity: 0; }
                
                .ticket-card { background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; padding: 25px; margin-bottom: 25px; transition: 0.2s; }
                .ticket-card:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform: translateY(-2px); }
                
                .tag-badge { background: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 900; letter-spacing: 0.5px; margin-right: 15px; }
                .content-box { background: #f8fafc; padding: 15px 20px; border-radius: 10px; margin: 15px 0; color: #0f172a; font-weight: 700; font-size: 15px; }
                
                .reply-section { display: flex; gap: 15px; align-items: center; }
                .reply-input { flex: 1; padding: 12px 15px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-family: Inter; font-size: 14px; transition: 0.2s; }
                .reply-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
                
                .btn-close-ticket { background: #3b82f6; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
                .btn-close-ticket:hover { background: #2563eb; }

                /* MODAL CSS */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: #fff; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 450px; animation: slideUp 0.3s ease-out; overflow: hidden; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div className={`toast ${toast.show ? 'toast-show' : 'toast-hide'}`} style={{ backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
                {toast.msg}
            </div>

            {/* MODAL XÁC NHẬN */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '50px', marginBottom: '15px' }}>📩</div>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{confirmModal.title}</h2>
                        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5' }}>{confirmModal.message}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Hủy bỏ</button>
                            <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Xác nhận Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <span style={{ fontSize: '36px' }}>🎫</span>
                <div>
                    <h1 style={{ color: '#0f172a', margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                        Hỗ trợ & Khiếu nại ({tickets.length})
                    </h1>
                </div>
            </div>

            {/* DANH SÁCH TICKET */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontWeight: 'bold' }}>
                        🎉 Tuyệt vời! Hiện tại không có khiếu nại nào cần xử lý.
                    </div>
                ) : (
                    tickets.map(t => (
                        <div key={t.id} className="ticket-card" style={{ borderColor: t.issueCategory === 'Tech_Bug' ? '#ef4444' : '#f59e0b' }}>
                            
                            {/* Title & Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="tag-badge" style={{ 
                                        background: t.issueCategory === 'Tech_Bug' ? '#fee2e2' : '#fef3c7', 
                                        color: t.issueCategory === 'Tech_Bug' ? '#b91c1c' : '#d97706' 
                                    }}>
                                        {t.issueCategory}
                                    </span>
                                    <span style={{ fontWeight: '800', color: '#475569', fontSize: '15px' }}>Từ: {t.senderName}</span>
                                </div>
                                <div style={{ color: '#f59e0b', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    ⏳ {t.status}
                                </div>
                            </div>

                            {/* Nội dung khiếu nại */}
                            <div className="content-box">
                                "{t.content}"
                            </div>

                            {/* Form Nhập Phản hồi */}
                            <div className="reply-section">
                                <input 
                                    type="text" 
                                    className="reply-input"
                                    placeholder="Nhập câu trả lời phản hồi cho User..." 
                                    value={replyText[t.id] || ''}
                                    onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })}
                                    onKeyDown={(e) => { if(e.key === 'Enter') handleResolveClick(t.id) }}
                                />
                                <button className="btn-close-ticket" onClick={() => handleResolveClick(t.id)}>
                                    Đóng Ticket
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}