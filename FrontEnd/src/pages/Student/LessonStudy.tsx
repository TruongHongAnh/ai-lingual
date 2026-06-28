import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function LessonStudy() {
    const { lessonId } = useParams();
    const navigate = useNavigate();

    // ==========================================
    // STATE CHO FLASHCARD HỌC TẬP
    // ==========================================
    const [vocabs, setVocabs] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFlipped, setIsFlipped] = useState(false); // Trạng thái lật thẻ

    // ==========================================
    // STATE CHO Q&A (HỎI ĐÁP & BÁO LỖI)
    // ==========================================
    const [qnaModalOpen, setQnaModalOpen] = useState(false);
    const [questionText, setQuestionText] = useState('');
    const [myQuestions, setMyQuestions] = useState<any[]>([]);

    // ==========================================
    // TOAST THÔNG BÁO CHUNG
    // ==========================================
    const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    // ==========================================
    // EFFECTS & API CALLS
    // ==========================================
    useEffect(() => {
        const fetchVocab = async () => {
            try {
                // Gọi API lấy từ vựng của đúng bài học được bấm
                const res = await apiClient.get(`/user/student/lesson/${lessonId}/vocab`);
                setVocabs(res.data);
            } catch (error) {
                console.error("Lỗi tải bài học");
            } finally {
                setLoading(false);
            }
        };
        fetchVocab();
    }, [lessonId]);

    // Tải lịch sử câu hỏi Q&A khi Modal được mở ra
    const loadMyQuestions = async () => {
        if (!lessonId) return;
        try {
            const res = await apiClient.get(`/user/userqna/my-questions/${lessonId}`);
            setMyQuestions(res.data);
        } catch (e) {
            console.error("Lỗi tải câu hỏi:", e);
        }
    };

    useEffect(() => {
        if (qnaModalOpen) loadMyQuestions();
    }, [qnaModalOpen]);

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleNext = () => {
        if (currentIndex < vocabs.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false); // Reset lật thẻ khi sang từ mới
        } else {
            alert("🎉 Chúc mừng bạn đã hoàn thành bài học!");
            navigate('/student/path'); // Quay lại lộ trình
        }
    };

    const handleSubmitQuestion = async () => {
        if (!questionText.trim()) {
            showToast('Vui lòng nhập nội dung câu hỏi!', 'error');
            return;
        }
        try {
            await apiClient.post('/user/userqna/submit', { lessonId, question: questionText });
            showToast('✅ Đã gửi câu hỏi thành công!', 'success');
            setQuestionText(''); // Xóa ô nhập
            loadMyQuestions();   // Tải lại danh sách để hiện ngay lập tức
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Lỗi gửi câu hỏi!', 'error');
        }
    };

    // ==========================================
    // GIAO DIỆN (RENDER)
    // ==========================================
    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#afafaf' }}>⏳ Đang tải bài học...</div>;
    if (vocabs.length === 0) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#ff4b4b' }}>❌ Bài học trống!</div>;

    const currentWord = vocabs[currentIndex];

    return (
        <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            {/* CSS TÍCH HỢP */}
            <style>{`
                /* CSS Cho Toast */
                .toast { position: fixed; top: 80px; right: 20px; padding: 16px 24px; border-radius: 12px; color: #fff; font-weight: 800; z-index: 9999; transition: 0.3s; box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
                .toast-show { transform: translateX(0); opacity: 1; }
                .toast-hide { transform: translateX(150%); opacity: 0; }
                
                /* Nút Hỏi đáp trôi nổi (FAB) */
                .fab-btn { position: fixed; bottom: 40px; right: 40px; background: #7c3aed; color: #fff; width: 65px; height: 65px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 28px; cursor: pointer; box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4); transition: 0.2s; border: none; z-index: 100; }
                .fab-btn:hover { transform: scale(1.1) rotate(10deg); background: #6d28d9; }

                /* CSS Modal Q&A */
                .qna-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
                .qna-modal-content { background: #fff; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 600px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            {/* HIỂN THỊ TOAST THÔNG BÁO */}
            <div className={`toast ${toast.show ? 'toast-show' : 'toast-hide'}`} style={{ backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
                {toast.msg}
            </div>

            {/* ==================================================== */}
            {/* KHU VỰC 1: HỌC TẬP (FLASHCARD)                       */}
            {/* ==================================================== */}
            
            {/* Thanh Tiến trình (Progress Bar) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#afafaf' }}>✖</button>
                <div style={{ flex: 1, height: '16px', backgroundColor: '#e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${((currentIndex + 1) / vocabs.length) * 100}%`, height: '100%', backgroundColor: '#58cc02', transition: 'width 0.3s' }}></div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#58cc02', fontSize: '18px' }}>{currentIndex + 1} / {vocabs.length}</div>
            </div>

            {/* Thẻ Học (Flashcard) */}
            <div 
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ height: '400px', backgroundColor: '#fff', border: '2px solid #e5e5e5', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', transition: 'all 0.3s', padding: '40px', textAlign: 'center', position: 'relative' }}
            >
                {!isFlipped ? (
                    <>
                        {/* Mặt trước: Tiếng Anh */}
                        <div style={{ fontSize: '18px', color: '#afafaf', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Từ mới</div>
                        <h1 style={{ fontSize: '50px', color: '#4b4b4b', margin: '0 0 10px 0' }}>{currentWord.word}</h1>
                        <div style={{ fontSize: '20px', color: '#1cb0f6', fontWeight: 'bold' }}>{currentWord.pronunciation}</div>
                        <div style={{ marginTop: 'auto', color: '#afafaf', fontWeight: 'bold', fontSize: '14px' }}>👆 Bấm vào thẻ để xem nghĩa</div>
                    </>
                ) : (
                    <>
                        {/* Mặt sau: Tiếng Việt + Ví dụ */}
                        <div style={{ fontSize: '18px', color: '#afafaf', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nghĩa của từ</div>
                        <h1 style={{ fontSize: '40px', color: '#58cc02', margin: '0 0 20px 0' }}>{currentWord.meaning}</h1>
                        
                        <div style={{ backgroundColor: '#f7f7f7', padding: '20px', borderRadius: '16px', width: '100%' }}>
                            <p style={{ fontStyle: 'italic', margin: '0 0 10px 0', fontSize: '18px', color: '#4b4b4b' }}>"{currentWord.example}"</p>
                            <p style={{ margin: 0, color: '#777', fontSize: '15px' }}>({currentWord.exampleTranslation})</p>
                        </div>
                    </>
                )}
            </div>

            {/* Nút Tiếp tục */}
            <button 
                onClick={handleNext}
                style={{ width: '100%', marginTop: '40px', padding: '18px', backgroundColor: '#58cc02', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase', boxShadow: '0 4px 0 #58a700', cursor: 'pointer' }}
            >
                Tiếp tục
            </button>


            {/* ==================================================== */}
            {/* KHU VỰC 2: Q&A (HỖ TRỢ & BÁO LỖI)                    */}
            {/* ==================================================== */}
            
            {/* ---- NÚT NỔI (FAB) ĐỂ GỌI HỖ TRỢ ---- */}
            <button className="fab-btn" title="Hỏi đáp / Báo lỗi" onClick={() => setQnaModalOpen(true)}>
                ❓
            </button>

            {/* ---- MODAL HỎI ĐÁP ---- */}
            {qnaModalOpen && (
                <div className="qna-modal-overlay" onClick={() => setQnaModalOpen(false)}>
                    <div className="qna-modal-content" onClick={e => e.stopPropagation()}>
                        
                        {/* Header Modal */}
                        <div style={{ background: '#7c3aed', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800' }}>Hỗ trợ & Báo lỗi bài học</h2>
                            <button onClick={() => setQnaModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>✕</button>
                        </div>

                        {/* Body Modal */}
                        <div style={{ padding: '25px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
                            
                            {/* Form Gửi câu hỏi mới */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <label style={{ display: 'block', fontWeight: '900', color: '#1e293b', marginBottom: '10px' }}>Bạn đang thắc mắc điều gì?</label>
                                <textarea 
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="Ví dụ: Cấu trúc câu này em chưa hiểu... hoặc Chữ này phát âm thế nào ạ?"
                                    style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'Inter', fontSize: '15px', resize: 'none', boxSizing: 'border-box' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                                    <button 
                                        onClick={handleSubmitQuestion}
                                        style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', transition: '0.2s' }}
                                    >
                                        <span>🚀</span> Gửi cho Biên tập viên
                                    </button>
                                </div>
                            </div>

                            {/* Lịch sử câu hỏi đã hỏi */}
                            <h3 style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '16px', fontWeight: '800' }}>Lịch sử Hỏi đáp trong bài này</h3>
                            {myQuestions.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                    Bạn chưa gửi câu hỏi nào.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {myQuestions.map((q) => (
                                        <div key={q.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            
                                            {/* Phần câu hỏi của Học viên */}
                                            <div style={{ padding: '15px 20px', background: '#fefce8', borderBottom: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <span style={{ fontWeight: '900', color: '#b45309', fontSize: '13px' }}>Bạn đã hỏi:</span>
                                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>{q.createdAt}</span>
                                                </div>
                                                <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '15px' }}>"{q.question}"</div>
                                            </div>

                                            {/* Phần trả lời của Biên tập viên */}
                                            <div style={{ padding: '15px 20px' }}>
                                                {q.status === 'Answered' && q.answer ? (
                                                    <>
                                                        <div style={{ fontWeight: '900', color: '#7c3aed', fontSize: '13px', marginBottom: '5px' }}>Biên tập viên trả lời:</div>
                                                        <div style={{ color: '#334155', lineHeight: '1.5' }}>{q.answer}</div>
                                                    </>
                                                ) : (
                                                    <div style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                                                        <span>⏳</span> Đang chờ Biên tập viên phản hồi...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}