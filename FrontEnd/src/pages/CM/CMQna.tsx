import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { getUserId } from '../../utils/auth';

interface Qna { 
    id: string; 
    lessonTitle: string; 
    studentName: string; 
    studentEmail: string;
    studentXp: number;
    studentIsBanned: boolean; // Dữ liệu thật từ DB
    question: string; 
    answer: string | null; 
    status: string; 
    createdAt: string; 
    unitTitle: string; 
    issueType: 'Grammar' | 'Bug' | 'General';
}

export default function CMQna() {
    const managerId = getUserId() || '';
    const [qnaList, setQnaList] = useState<Qna[]>([]);
    const [chartData, setChartData] = useState<{ day: string, count: number }[]>([]);
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const openConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

    const [studentModal, setStudentModal] = useState<{ isOpen: boolean, student: Qna | null }>({ isOpen: false, student: null });

    const loadDashboardData = async () => {
        try { 
            const [qnaRes, statsRes] = await Promise.all([
                apiClient.get<Qna[]>('/cm/qna/pending'),
                apiClient.get<{ day: string, count: number }[]>('/cm/qna/stats')
            ]);
            
            // Dùng 100% DỮ LIỆU THẬT TỪ DATABASE, Không có Math.random
            setQnaList(qnaRes.data); 
            setChartData(statsRes.data);
        } catch (e) {
            console.error("Lỗi lấy dữ liệu từ Backend", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDashboardData(); }, []);

    const handleSendAnswerClick = (qnaId: string) => {
        const answer = replyText[qnaId];
        if (!answer?.trim()) { showToast('Vui lòng nhập nội dung giải thích!', 'error'); return; }
        
        openConfirm(
            "Xác nhận phản hồi", 
            "Bạn có chắc chắn muốn gửi câu trả lời này cho học viên không? Khiếu nại sẽ được đóng lại.", 
            async () => {
                try {
                    await apiClient.put('/cm/qna/reply', { qnaId, managerId, answerText: answer });
                    showToast('✅ Đã lưu phản hồi thành công!', 'success');
                    setReplyText(prev => ({ ...prev, [qnaId]: '' }));
                    loadDashboardData(); 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (err: any) { 
                    showToast(err.response?.data?.message || 'Lỗi khi gửi phản hồi!', 'error'); 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        );
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, qnaId: string) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
        setReplyText({ ...replyText, [qnaId]: e.target.value });
    };

    // Tính toán trục Y cho biểu đồ (Đảm bảo cột cao nhất luôn có mốc chuẩn)
    const maxCount = chartData.length > 0 ? Math.max(...chartData.map(d => d.count), 5) : 5;

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' }}>⏳ Đang đồng bộ với Database...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <style>{`
                .toast { position: fixed; top: 80px; right: 20px; padding: 16px 24px; border-radius: 12px; color: #fff; font-weight: 800; z-index: 9999; box-shadow: 0 10px 15px rgba(0,0,0,0.1); transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
                .toast-show { transform: translateX(0); opacity: 1; }
                .toast-hide { transform: translateX(150%); opacity: 0; }
                
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: #fff; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; animation: slideUp 0.3s ease-out; overflow: hidden; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .dashboard-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .qna-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: 0.2s; }
                .qna-card:hover { border-color: #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
                
                .student-bubble { background: #fefce8; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 12px 12px 12px; margin-bottom: 25px; position: relative; }
                .student-bubble::before { content: ''; position: absolute; top: 0; left: -10px; border-top: 10px solid #fefce8; border-left: 10px solid transparent; }
                
                .textarea-clean { width: 100%; min-height: 80px; padding: 15px; border-radius: 12px; border: 2px solid #e2e8f0; outline: none; font-family: Inter, sans-serif; font-size: 15px; color: #0f172a; resize: none; overflow: hidden; transition: 0.2s; box-sizing: border-box; background: #f8fafc; }
                .textarea-clean:focus { border-color: #7c3aed; background: #fff; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
                
                .btn-submit { background: #7c3aed; color: #fff; border: none; padding: 0 35px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .btn-submit:hover { background: #6d28d9; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(109, 40, 217, 0.3); }

                /* CSS Chart Xịn Xò */
                .chart-wrapper { position: relative; height: 180px; border-bottom: 2px solid #cbd5e1; border-left: 2px solid #cbd5e1; display: flex; align-items: flex-end; padding-left: 10px; gap: 15px; margin-top: 30px; margin-left: 20px; margin-bottom: 25px;}
                .grid-line { position: absolute; left: 0; right: 0; border-top: 1px dashed #e2e8f0; z-index: 0; }
                .y-label { position: absolute; left: -25px; color: #94a3b8; font-size: 12px; font-weight: bold; transform: translateY(-50%); }
                .bar-group { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; flex: 1; }
                .bar { width: 100%; max-width: 40px; background: #c4b5fd; border-radius: 4px 4px 0 0; transition: 0.3s; position: relative; cursor: pointer; }
                .bar:hover { background: #7c3aed; }
                .bar-value { position: absolute; top: -25px; width: 100%; text-align: center; font-size: 12px; font-weight: 900; color: #7c3aed; opacity: 0; transition: 0.2s; }
                .bar:hover .bar-value { opacity: 1; transform: translateY(-3px); }

                .avatar-sm { width: 35px; height: 35px; border-radius: 50%; background: #e0e7ff; color: #4f46e5; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 14px; cursor: pointer; transition: 0.2s; }
                .avatar-sm:hover { transform: scale(1.1); box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
                .badge-type { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; }
                .badge-bug { background: #fee2e2; color: #ef4444; }
                .badge-grammar { background: #e0e7ff; color: #4f46e5; }
            `}</style>

            <div className={`toast ${toast.show ? 'toast-show' : 'toast-hide'}`} style={{ backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
                {toast.msg}
            </div>

            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '50px', marginBottom: '15px' }}>💬</div>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{confirmModal.title}</h2>
                        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5' }}>{confirmModal.message}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Kiểm tra lại</button>
                            <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Gửi phản hồi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÔNG TIN HỌC VIÊN CHUẨN XÁC TỪ DATABASE */}
            {studentModal.isOpen && studentModal.student && (
                <div className="modal-overlay" onClick={() => setStudentModal({ isOpen: false, student: null })}>
                    <div className="modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
                            <button onClick={() => setStudentModal({ isOpen: false, student: null })} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', color: '#7c3aed', fontSize: '32px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                                {studentModal.student.studentName.charAt(0)}
                            </div>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '900' }}>{studentModal.student.studentName}</h2>
                            <p style={{ margin: '5px 0 0 0', color: '#e0e7ff', fontSize: '14px' }}>{studentModal.student.studentEmail}</p>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px' }}>Tổng điểm XP</div>
                                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>
                                        {studentModal.student.studentXp?.toLocaleString() || 0}
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px' }}>Trạng thái tài khoản</div>
                                    <div style={{ fontSize: '16px', fontWeight: '900', color: studentModal.student.studentIsBanned ? '#ef4444' : '#10b981', marginTop: '5px' }}>
                                        {studentModal.student.studentIsBanned ? '🚫 Đang bị khóa' : '✅ Hoạt động'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                <span style={{ fontSize: '36px' }}>🎧</span>
                <div>
                    <h1 style={{ color: '#0f172a', margin: 0, fontSize: '30px', fontWeight: '900', letterSpacing: '-0.5px' }}>Trung tâm Phản hồi (Support Center)</h1>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '16px' }}>Theo dõi biểu đồ và giải đáp thắc mắc của học viên.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', marginBottom: '40px' }}>
                <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', borderColor: '#fca5a5' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', marginBottom: '10px' }}>Yêu cầu đang chờ</div>
                    <div style={{ fontSize: '64px', fontWeight: '900', color: '#ef4444', lineHeight: '1' }}>{qnaList.length}</div>
                    <div style={{ fontSize: '14px', color: '#b91c1c', fontWeight: '600', marginTop: '10px' }}>Dữ liệu Đồng bộ Realtime</div>
                </div>

                {/* BIỂU ĐỒ CHUẨN CÓ TRỤC TỌA ĐỘ VÀ GRID LINE */}
                <div className="dashboard-card">
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#1e293b', fontWeight: '900' }}>Biểu đồ Câu hỏi (7 ngày qua)</h3>
                    
                    <div className="chart-wrapper">
                        <div className="grid-line" style={{ bottom: '25%' }}></div>
                        <div className="grid-line" style={{ bottom: '50%' }}></div>
                        <div className="grid-line" style={{ bottom: '75%' }}></div>
                        <div className="grid-line" style={{ top: '0' }}></div>
                        
                        <div className="y-label" style={{ top: '0' }}>{maxCount}</div>
                        <div className="y-label" style={{ top: '50%' }}>{Math.round(maxCount/2)}</div>

                        {chartData.map((data, idx) => {
                            const heightPercent = data.count > 0 ? (data.count / maxCount) * 100 : 2; // Tối thiểu 2% để nhìn thấy vạch
                            return (
                                <div key={idx} className="bar-group">
                                    <div className="bar" style={{ height: `${heightPercent}%`, backgroundColor: data.day === 'CN' ? '#7c3aed' : '#c4b5fd' }}>
                                        {data.count > 0 && <div className="bar-value">{data.count}</div>}
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', position: 'absolute', bottom: '-25px' }}>
                                        {data.day}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {qnaList.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎉</div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '22px', fontWeight: '800' }}>Tuyệt vời! Database đã sạch sẽ.</h2>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>Không còn câu hỏi hay báo lỗi nào đang chờ phản hồi.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>📋 Danh sách cần xử lý</span>
                    </h3>

                    {qnaList.map(q => (
                        <div key={q.id} className="qna-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px dashed #f1f5f9', paddingBottom: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>📍 Bối cảnh câu hỏi</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#0f172a', fontWeight: '600', fontSize: '15px' }}>{q.unitTitle}</span>
                                        <span style={{ color: '#cbd5e1' }}>❯</span>
                                        <span style={{ color: '#7c3aed', fontWeight: '800', fontSize: '15px', background: '#f3e8ff', padding: '4px 10px', borderRadius: '8px' }}>{q.lessonTitle}</span>
                                        <div style={{ marginLeft: '10px' }}>
                                            {q.issueType === 'Bug' ? <span className="badge-type badge-bug">🐛 Báo lỗi</span> : <span className="badge-type badge-grammar">❓ Ngữ pháp</span>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{q.studentName}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{q.createdAt}</div>
                                    </div>
                                    <div className="avatar-sm" title="Xem hồ sơ học viên" onClick={() => setStudentModal({ isOpen: true, student: q })}>
                                        {q.studentName.charAt(0)}
                                    </div>
                                </div>
                            </div>

                            <div className="student-bubble">
                                <div style={{ fontSize: '16px', color: '#0f172a', lineHeight: '1.6', fontWeight: '500' }}>"{q.question}"</div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', alignItems: 'stretch' }}>
                                <div style={{ flex: 1 }}>
                                    <textarea className="textarea-clean" placeholder="Nhập câu trả lời giải thích chi tiết cho học viên..." value={replyText[q.id] || ''} onChange={(e) => handleTextareaChange(e, q.id)} />
                                </div>
                                <button onClick={() => handleSendAnswerClick(q.id)} className="btn-submit"><span style={{ fontSize: '20px' }}>📤</span> Phản hồi</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}