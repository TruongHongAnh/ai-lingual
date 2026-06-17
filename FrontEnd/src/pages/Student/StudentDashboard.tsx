import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { getUserId } from '../../utils/auth';

interface Flashcard { id: string; targetWord: string; translation: string; easeFactor: number; intervalDays: number; nextReviewDate: string; }
interface Leaderboard { id: string; fullName: string; leagueTier: string; weeklyXP: number; }
interface Ticket { id: string; issueCategory: string; content: string; adminReply: string | null; status: string; createdAt: string; }

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState<'progress' | 'flashcards' | 'tickets'>('progress');
    const userId = getUserId();

    // States cho từng chức năng
    const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);

    // Form States
    const [newWord, setNewWord] = useState({ word: '', mean: '' });
    const [ticketForm, setTicketForm] = useState({ category: 'Payment', content: '' });

    useEffect(() => {
        if (userId) {
            loadLeaderboard();
            loadFlashcards();
            loadTickets();
        }
    }, [userId]);

    const loadLeaderboard = async () => {
        const res = await apiClient.get<Leaderboard[]>('/student/leaderboard/current-week');
        setLeaderboard(res.data);
    };

    const loadFlashcards = async () => {
        const res = await apiClient.get<Flashcard[]>(`/student/flashcards?userId=${userId}`);
        setFlashcards(res.data);
    };

    const loadTickets = async () => {
        const res = await apiClient.get<Ticket[]>(`/student/tickets?userId=${userId}`);
        setTickets(res.data);
    };

    const handleAddWord = async (e: React.FormEvent) => {
        e.preventDefault();
        await apiClient.post('/student/flashcards/create', { userId, targetWord: newWord.word, translation: newWord.mean });
        setNewWord({ word: '', mean: '' });
        loadFlashcards();
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        await apiClient.post('/student/tickets/create', { senderId: userId, issueCategory: ticketForm.category, content: ticketForm.content });
        setTicketForm({ category: 'Payment', content: '' });
        alert('Đã gửi khiếu nại thành công lên Ban quản trị!');
        loadTickets();
    };

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            {/* THANH CHUYỂN TAB CHỨC NĂNG */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '25px' }}>
                <button onClick={() => setActiveTab('progress')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'progress' ? '#2563eb' : '#e2e8f0', color: activeTab === 'progress' ? '#fff' : '#475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📊 Tiến độ & Xếp hạng</button>
                <button onClick={() => setActiveTab('flashcards')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'flashcards' ? '#2563eb' : '#e2e8f0', color: activeTab === 'flashcards' ? '#fff' : '#475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🧠 Sổ Từ Vựng (Anki)</button>
                <button onClick={() => setActiveTab('tickets')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'tickets' ? '#2563eb' : '#e2e8f0', color: activeTab === 'tickets' ? '#fff' : '#475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>✉️ Hỗ Trợ & Khiếu Nại</button>
            </div>

            {/* TAB 1: TIẾN ĐỘ & BẢNG XẾP HẠNG */}
            {activeTab === 'progress' && (
                <div>
                    <h3>🏆 Bảng Xếp Hạng Thách Đấu Tuần (Hạng Kim Cương)</h3>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        {leaderboard.map((user, idx) => (
                            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0', fontWeight: idx === 0 ? 'bold' : 'normal', color: idx === 0 ? '#b45309' : '#1e293b' }}>
                                <span>#{idx + 1} {user.fullName}</span>
                                <span>🔥 {user.weeklyXP} XP</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: SPACED-REPETITION FLASHCARDS */}
            {activeTab === 'flashcards' && (
                <div>
                    <h3>🧠 Thuật toán Lặp lại ngắt quãng (SuperMemo SM-2)</h3>
                    <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input type="text" placeholder="Từ tiếng Anh" value={newWord.word} onChange={e => setNewWord({ ...newWord, word: e.target.value })} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <input type="text" placeholder="Nghĩa tiếng Việt" value={newWord.mean} onChange={e => setNewWord({ ...newWord, mean: e.target.value })} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Thêm từ</button>
                    </form>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{ padding: '10px' }}>Từ vựng</th><th style={{ padding: '10px' }}>Ý nghĩa</th><th style={{ padding: '10px' }}>Độ khó (EF)</th><th style={{ padding: '10px' }}>Ngày ôn tiếp theo</th></tr></thead>
                        <tbody>
                            {flashcards.map(card => (
                                <tr key={card.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{card.targetWord}</td>
                                    <td style={{ padding: '10px' }}>{card.translation}</td>
                                    <td style={{ padding: '10px', color: '#0284c7' }}>{card.easeFactor.toFixed(1)}</td>
                                    <td style={{ padding: '10px', fontSize: '13px' }}>{new Date(card.nextReviewDate).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 3: GỬI KHIẾU NẠI MẤT ACC/LỖI TIỀN */}
            {activeTab === 'tickets' && (
                <div>
                    <h3>✉️ Trung tâm hỗ trợ kỹ thuật & Đối soát hóa đơn</h3>
                    <form onSubmit={handleCreateTicket} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '30px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vấn đề cần khiếu nại:</label>
                            <select value={ticketForm.category} onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })} style={{ padding: '8px', width: '100%', borderRadius: '4px' }}>
                                <option value="Payment">Lỗi giao dịch / Nạp VIP không nhận được quyền lợi</option>
                                <option value="Account">Sự cố mất tài khoản / Không đồng bộ tiến độ</option>
                                <option value="Tech_Bug">Báo cáo lỗi hệ thống phần mềm (Bug)</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mô tả chi tiết sự việc:</label>
                            <textarea rows={3} value={ticketForm.content} onChange={e => setTicketForm({ ...ticketForm, content: e.target.value })} required style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #cbd5e1' }} placeholder="Ghi rõ mã hóa đơn giao dịch hoặc tên tài khoản bị sự cố..." />
                        </div>
                        <button type="submit" style={{ background: '#ef4444', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Gửi Yêu Cầu Hỗ Trợ</button>
                    </form>

                    <h4>Lịch sử xử lý khiếu nại của bạn</h4>
                    {tickets.map(t => (
                        <div key={t.id} style={{ padding: '15px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>[{t.issueCategory}] Phiếu gửi ngày {new Date(t.createdAt).toLocaleDateString('vi-VN')}</span>
                                <span style={{ color: t.status === 'Resolved' ? 'green' : 'orange' }}>{t.status === 'Resolved' ? '✅ Đã Giải Quyết' : '⏳ Đang Chờ'}</span>
                            </div>
                            <p style={{ margin: '10px 0 5px 0', color: '#475569' }}>👉 <b>Nội dung:</b> {t.content}</p>
                            {t.adminReply && <p style={{ margin: 0, padding: '8px', background: '#f0fdf4', color: '#166534', borderRadius: '4px' }}>👑 <b>Admin phản hồi:</b> {t.adminReply}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}