import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface PendingLesson { id: string; unitName: string; lessonName: string; cmName: string; submitTime: string; }
interface VocabPreview { word: string; meaning: string; pronunciation: string; exampleSentence: string; exampleTranslation: string; }

export default function AdminApprovals() {
    const [pendingLessons, setPendingLessons] = useState<PendingLesson[]>([]);
    const [loading, setLoading] = useState(true);

    // STATE CHO TOAST THÔNG BÁO
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    // STATE CHO MODAL XÁC NHẬN (DUYỆT / TỪ CHỐI)
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, lessonId: string, lessonName: string, action: 'Approve' | 'Reject' }>({ isOpen: false, lessonId: '', lessonName: '', action: 'Approve' });

    // STATE CHO MODAL XEM TRƯỚC
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean, lessonName: string, vocabs: VocabPreview[], isLoading: boolean }>({ isOpen: false, lessonName: '', vocabs: [], isLoading: false });

    // 1. TẢI DANH SÁCH BÀI HỌC CHỜ DUYỆT
    const loadPendingLessons = async () => {
        try {
            const res = await apiClient.get('/admin/admin/pending-lessons');
            setPendingLessons(res.data);
        } catch (error) { console.error("Lỗi tải bài học chờ duyệt:", error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { loadPendingLessons(); }, []);

    // 2. MỞ MODAL XEM TRƯỚC VÀ GỌI API LẤY TỪ VỰNG
    const handleOpenPreview = async (lessonId: string, lessonName: string) => {
        setPreviewModal({ isOpen: true, lessonName, vocabs: [], isLoading: true });
        try {
            const res = await apiClient.get(`/admin/admin/lesson-preview/${lessonId}`);
            setPreviewModal({ isOpen: true, lessonName, vocabs: res.data, isLoading: false });
        } catch (error) {
            setPreviewModal(prev => ({ ...prev, isLoading: false }));
            showToast("Không thể tải nội dung xem trước!", "error");
        }
    };

    // 3. XỬ LÝ DUYỆT HOẶC TỪ CHỐI (KHI BẤM XÁC NHẬN TRONG MODAL)
    const handleConfirmAction = async () => {
        const { lessonId, action } = confirmModal;
        try {
            if (action === 'Approve') {
                await apiClient.put('/admin/admin/approve-lesson', { lessonId });
                showToast('✅ Đã duyệt bài học lên hệ thống thành công!', 'success');
            } else {
                await apiClient.put('/admin/admin/reject-lesson', { lessonId });
                showToast('❌ Đã từ chối bài học, yêu cầu Biên tập viên sửa lại!', 'error');
            }
            setConfirmModal({ ...confirmModal, isOpen: false });
            loadPendingLessons(); // Cập nhật lại danh sách
        } catch (error: any) {
            showToast(error.response?.data?.message || "Lỗi xử lý!", "error");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' }}>⏳ Đang tải dữ liệu từ Database...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <style>
                {`
                    .toast { position: fixed; top: 20px; right: 20px; padding: 16px 24px; border-radius: 16px; color: #fff; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 10px; z-index: 9999; box-shadow: 0 10px 25px rgba(0,0,0,0.1); transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s; }
                    .toast-hidden { transform: translateX(150%); opacity: 0; }
                    .toast-visible { transform: translateX(0); opacity: 1; }

                    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
                    .modal-content { background: #fff; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out; }
                    
                    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                `}
            </style>

            {/* TOAST THÔNG BÁO XỊN XÒ */}
            <div className={`toast ${toast.show ? 'toast-visible' : 'toast-hidden'}`} style={{ backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
                {toast.msg}
            </div>

            <h1 style={{ color: '#0f172a', marginBottom: '10px', fontSize: '28px', fontWeight: '900' }}>✅ Xét duyệt Giáo trình</h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Kiểm duyệt nội dung do Biên tập viên (CM) đệ trình trước khi công khai cho Học viên.</p>

            {/* DANH SÁCH BÀI HỌC CHỜ DUYỆT */}
            {pendingLessons.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                    <div style={{ fontSize: '40px', marginBottom: '15px' }}>🎉</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Không có bài học nào đang chờ duyệt.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {pendingLessons.map(lesson => (
                        <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}>
                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>{lesson.unitName}</div>
                                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>{lesson.lessonName}</div>
                                <div style={{ fontSize: '14px', color: '#475569' }}>Người đệ trình: <b style={{ color: '#7c3aed' }}>{lesson.cmName}</b> • {lesson.submitTime}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleOpenPreview(lesson.id, lesson.lessonName)} style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                                    👁️ Xem trước
                                </button>
                                <button onClick={() => setConfirmModal({ isOpen: true, lessonId: lesson.id, lessonName: lesson.lessonName, action: 'Reject' })} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fca5a5'} onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}>
                                    Từ chối
                                </button>
                                <button onClick={() => setConfirmModal({ isOpen: true, lessonId: lesson.id, lessonName: lesson.lessonName, action: 'Approve' })} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10b981'}>
                                    Duyệt nội dung
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 1: XÁC NHẬN DUYỆT / TỪ CHỐI */}
            {/* ======================================================== */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '50px', marginBottom: '15px' }}>{confirmModal.action === 'Approve' ? '✅' : '⚠️'}</div>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>
                            {confirmModal.action === 'Approve' ? 'Xác nhận Duyệt bài' : 'Từ chối bài học'}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5' }}>
                            Bạn có chắc chắn muốn {confirmModal.action === 'Approve' ? 'duyệt' : 'từ chối'} bài học <b>"{confirmModal.lessonName}"</b> không?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Hủy bỏ</button>
                            <button onClick={handleConfirmAction} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: confirmModal.action === 'Approve' ? '#10b981' : '#ef4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                                Xác nhận {confirmModal.action === 'Approve' ? 'Duyệt' : 'Từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2: XEM TRƯỚC NỘI DUNG TỪ VỰNG */}
            {/* ======================================================== */}
            {previewModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                        
                        {/* Header Modal */}
                        <div style={{ padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Nội dung chi tiết</div>
                                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{previewModal.lessonName}</h2>
                            </div>
                            <button onClick={() => setPreviewModal({ ...previewModal, isOpen: false })} style={{ background: 'transparent', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>✖</button>
                        </div>

                        {/* Body Modal (Danh sách từ vựng) */}
                        <div style={{ padding: '30px', overflowY: 'auto', background: '#fff' }}>
                            {previewModal.isLoading ? (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>⏳ Đang tải nội dung...</div>
                            ) : previewModal.vocabs.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#ef4444', padding: '40px', background: '#fee2e2', borderRadius: '12px', fontWeight: 'bold' }}>
                                    ⚠️ Bài học này chưa có từ vựng nào! Vui lòng Từ chối để CM thêm dữ liệu.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {previewModal.vocabs.map((v, idx) => (
                                        <div key={idx} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{v.word}</span>
                                                <span style={{ color: '#7c3aed', fontWeight: 'bold', background: '#f3e8ff', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>{v.pronunciation || 'N/A'}</span>
                                            </div>
                                            <div style={{ color: '#10b981', fontWeight: '800', fontSize: '15px', marginBottom: '10px' }}>{v.meaning}</div>
                                            
                                            {v.exampleSentence && (
                                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '10px', fontSize: '14px' }}>
                                                    <div style={{ color: '#334155', fontStyle: 'italic', marginBottom: '4px' }}>"{v.exampleSentence}"</div>
                                                    <div style={{ color: '#64748b' }}>{v.exampleTranslation}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Footer Modal */}
                        <div style={{ padding: '20px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
                            <button onClick={() => setPreviewModal({ ...previewModal, isOpen: false })} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Đóng cửa sổ</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}