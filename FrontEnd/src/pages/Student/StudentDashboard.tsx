import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleView, setRoleView] = useState<'student' | 'teacher'>('student');

    const recentActivities = [
        { id: 1, name: 'T***n M.', action: 'đã phân tích câu hỏi ngữ pháp SVO', time: '5 phút trước' },
        { id: 2, name: 'H***g A.', action: 'luyện hội thoại AI chủ đề Du lịch', time: '12 phút trước' },
        { id: 3, name: 'V***p U.', action: 'vừa hoàn thành bài thi IELTS (7.5)', time: '20 phút trước' },
        { id: 4, name: 'K***a N.', action: 'thêm 15 từ vựng vào Sổ tay Anki', time: '1 giờ trước' },
    ];

    const tools = [
        { icon: '🎧', title: 'Nghe chép chính tả (Dictation)', desc: 'Luyện nghe video người bản xứ và chép lại câu', tag: 'Hot', tagColor: '#ef4444', tagBg: '#fee2e2' },
        { icon: '🪄', title: 'AI Phân tích Ngữ pháp', desc: 'Sửa lỗi cấu trúc câu, giải thích cặn kẽ từ loại', tag: 'AI', tagColor: '#8b5cf6', tagBg: '#ede9fe' },
        { icon: '🗣️', title: 'Hội thoại Role-play', desc: 'Đóng vai giao tiếp với Bot AI theo chủ đề', tag: 'Mới', tagColor: '#10b981', tagBg: '#d1fae5' },
        { icon: '🗂️', title: 'Sổ tay Spaced-Repetition', desc: 'Luyện từ vựng bằng thuật toán lặp lại ngắt quãng', tag: 'Cốt lõi', tagColor: '#475569', tagBg: '#f1f5f9' },
        { icon: '📝', title: 'Dịch thuật Ngữ cảnh', desc: 'Dịch sát nghĩa theo văn phong học thuật/giao tiếp', tag: '', tagColor: '', tagBg: '' },
        { icon: '🎯', title: 'Luyện thi IELTS / JLPT', desc: 'Ngân hàng đề thi format chuẩn có tính giờ', tag: 'Pro', tagColor: '#f59e0b', tagBg: '#fef3c7' },
    ];

    const testimonials = [
        { quote: "Trợ lý AI sửa ngữ pháp cực kỳ chi tiết, chỉ ra rõ vì sao mình sai cấu trúc thay vì chỉ đưa đáp án.", name: "Nguyễn Minh Anh", role: "Học viên IELTS 6.5", avatar: "A" },
        { quote: "Thuật toán lặp lại ngắt quãng giúp mình nhớ 2000 từ vựng tiếng Nhật N3 chỉ trong 2 tháng.", name: "Lê Hoàng Long", role: "Du học sinh Nhật", avatar: "L" },
        { quote: "Tính năng Role-play với AI giúp sinh viên của tôi dạn dĩ hơn hẳn khi luyện Speaking.", name: "Cô Trần Thu Hà", role: "Giảng viên Đại học", avatar: "H" }
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate('/student/ai-practice');
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* 1. HERO SECTION */}
            <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '20px' }}>
                <h1 style={{ fontSize: '42px', color: '#1e293b', margin: '0 0 15px 0', fontWeight: '800', letterSpacing: '-1px' }}>
                    Công cụ học Ngoại ngữ <br /> <span style={{ color: '#1e293b' }}>cho người Việt</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 30px 0' }}>
                    Tra từ, phân tích ngữ pháp, luyện giao tiếp AI, ôn tập Flashcard – tất cả <br/> đều được tối ưu hóa, thông minh và tiện lợi.
                </p>

                <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                    <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Tìm từ vựng, ngữ pháp, hoặc nghĩa tiếng Việt..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        style={{ width: '100%', padding: '18px 20px 18px 50px', borderRadius: '40px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} 
                    />
                </form>
            </div>

            {/* 2. STATS & RECENT ACTIVITIES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', width: '100%', marginBottom: '20px' }}>
                
                {/* Học viên */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#475569', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>👥 Học viên</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <h2 style={{ fontSize: '36px', margin: 0, color: '#0f172a' }}>10.945</h2>
                        <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>+110 hôm nay</span>
                    </div>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Cùng học ngoại ngữ mỗi ngày</p>
                </div>

                {/* Thư viện */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#475569', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>📚 Thư viện Giáo trình</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <div><h2 style={{ fontSize: '28px', margin: 0, color: '#0f172a' }}>1.204</h2><p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Cấu trúc Ngữ pháp</p></div>
                        <div style={{ width: '1px', height: '40px', backgroundColor: '#e2e8f0' }}></div>
                        <div><h2 style={{ fontSize: '28px', margin: 0, color: '#0f172a' }}>17.979</h2><p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Từ vựng đa ngành</p></div>
                    </div>
                </div>

                {/* Hoạt động gần đây */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', gridRow: 'span 2' }}>
                    <div style={{ color: '#475569', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px' }}>🔔 Hoạt động gần đây</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {recentActivities.map(act => (
                            <div key={act.id} style={{ background: '#f8fafc', padding: '12px 15px', borderRadius: '8px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                    <span>✍️</span> 
                                    <span style={{ color: '#1e293b' }}><b>{act.name}</b> {act.action}</span>
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '24px' }}>{act.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Đang online */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
                        <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span> Đang online
                    </div>
                    <h2 style={{ fontSize: '36px', margin: 0, color: '#0f172a' }}>204</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Học viên trên trang</p>
                </div>

                {/* Từ vựng luyện hôm nay */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>✍️ Từ vựng luyện hôm nay</div>
                    <h2 style={{ fontSize: '36px', margin: 0, color: '#0f172a' }}>53.624</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Từ được tra và ôn tập mỗi giờ</p>
                </div>
            </div>

            {/* 3. TOGGLE CHỌN ĐỐI TƯỢNG */}
            <div style={{ marginTop: '40px', marginBottom: '40px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>Bạn đang dùng cho ai?</p>
                <div style={{ display: 'inline-flex', backgroundColor: '#eef2f6', padding: '6px', borderRadius: '12px' }}>
                    <button 
                        onClick={() => setRoleView('student')} 
                        style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', color: roleView === 'student' ? '#1e293b' : '#64748b', backgroundColor: roleView === 'student' ? '#fff' : 'transparent', boxShadow: roleView === 'student' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                    >
                        👤 Học viên
                    </button>
                    <button 
                        onClick={() => setRoleView('teacher')} 
                        style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', color: roleView === 'teacher' ? '#1e293b' : '#64748b', backgroundColor: roleView === 'teacher' ? '#fff' : 'transparent', boxShadow: roleView === 'teacher' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                    >
                        🎓 Giáo viên
                    </button>
                </div>
            </div>

            {/* 4. CÔNG CỤ HỌC (GRID) */}
            <div style={{ width: '100%', marginBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '20px', color: '#0f172a', margin: 0 }}>Công cụ học</h3>
                    <span style={{ color: '#475569', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>Xem tất cả công cụ →</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    {tools.map((tool, idx) => (
                        <div key={idx} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>{tool.icon}</span>
                                    <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>{tool.title}</h4>
                                </div>
                                {tool.tag && (
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: tool.tagColor, backgroundColor: tool.tagBg, padding: '2px 8px', borderRadius: '12px' }}>{tool.tag}</span>
                                )}
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>{tool.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Ý KIẾN NGƯỜI DÙNG (TESTIMONIALS) */}
            <div style={{ width: '100%', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '20px' }}>Ý kiến người dùng</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    {testimonials.map((testi, idx) => (
                        <div key={idx} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '15px', lineHeight: '1.6' }}>“{testi.quote}”</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                                    {testi.avatar}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>{testi.name}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{testi.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}