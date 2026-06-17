import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { getUserId } from '../../utils/auth';

interface Course { id: string; title: string; targetLanguage: string; }
interface Qna { id: string; lessonTitle: string; studentName: string; question: string; answer: string | null; status: string; }

export default function CMDashboard() {
    const [activeTab, setActiveTab] = useState<'curriculum' | 'qna'>('curriculum');
    const managerId = getUserId();

    const [courses, setCourses] = useState<Course[]>([]);
    const [qnaList, setQnaList] = useState<Qna[]>([]);

    // Form states
    const [courseForm, setCourseForm] = useState({ title: '', lang: 'en' });
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        loadCourses();
        loadQna();
    }, []);

    const loadCourses = async () => {
        const res = await apiClient.get<Course[]>('/cm/courses/all');
        setCourses(res.data);
    };

    const loadQna = async () => {
        const res = await apiClient.get<Qna[]>('/cm/qna/pending');
        setQnaList(res.data);
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        await apiClient.post('/cm/courses/create', { title: courseForm.title, targetLanguage: courseForm.lang });
        setCourseForm({ title: '', lang: 'en' });
        loadCourses();
    };

    const handleSendAnswer = async (qnaId: string) => {
        const answer = replyText[qnaId];
        if (!answer?.trim()) return;

        await apiClient.put('/cm/cm/reply-student-qna', { qnaId, managerId, answerText: answer });
        alert('Đã gửi lời giải thích học thuật thành công!');
        loadQna();
    };

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '25px' }}>
                <button onClick={() => setActiveTab('curriculum')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'curriculum' ? '#059669' : '#e2e8f0', color: activeTab === 'curriculum' ? '#fff' : '#475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📚 Quản lý Giáo trình</button>
                <button onClick={() => setActiveTab('qna')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'qna' ? '#059669' : '#e2e8f0', color: activeTab === 'qna' ? '#fff' : '#475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💬 Trả lời câu hỏi học viên ({qnaList.length})</button>
            </div>

            {/* TAB 1: BIÊN TẬP KHÓA HỌC/BÀI HỌC */}
            {activeTab === 'curriculum' && (
                <div>
                    <h3>📚 Bản đồ xây dựng khóa học ngôn ngữ</h3>
                    <form onSubmit={handleCreateCourse} style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                        <input type="text" placeholder="Tên khóa học mới (VD: Tiếng Anh du lịch...)" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required style={{ flex: 1, padding: '8px' }} />
                        <select value={courseForm.lang} onChange={e => setCourseForm({ ...courseForm, lang: e.target.value })} style={{ padding: '8px' }}>
                            <option value="en">Tiếng Anh (EN)</option>
                            <option value="ja">Tiếng Nhật (JA)</option>
                        </select>
                        <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Tạo khóa học</button>
                    </form>

                    <h4>Danh sách khóa học hiện hành trong Hệ thống</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {courses.map(c => (
                            <div key={c.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                                <h4 style={{ margin: '0 0 5px 0' }}>📘 {c.title}</h4>
                                <span style={{ fontSize: '12px', background: '#cbd5e1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Mã NN: {c.targetLanguage}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: GIẢI ĐÁP THẮC MẮC HỌC THUẬT */}
            {activeTab === 'qna' && (
                <div>
                    <h3>💬 Thắc mắc về lỗi nội dung và bài giảng từ Học viên</h3>
                    {qnaList.length === 0 ? <p style={{ color: '#64748b' }}>Hệ thống sạch sẽ, không có câu hỏi nào đang tồn đọng.</p> : (
                        qnaList.map(q => (
                            <div key={q.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>
                                    🎯 Bài học: <b>{q.lessonTitle}</b> | Học viên: <b style={{ color: '#0284c7' }}>{q.studentName}</b>
                                </div>
                                <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#1e293b' }}>❓ Câu hỏi: {q.question}</p>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="text" placeholder="Nhập lời giải thích chuyên môn hoặc sửa lỗi dịch..." value={replyText[q.id] || ''} onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                    <button onClick={() => handleSendAnswer(q.id)} style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Gửi đáp án</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}