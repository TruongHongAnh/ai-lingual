import React, { useState } from 'react';

export default function Dictionary() {
    const [inputText, setInputText] = useState('translation');

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', color: '#0f172a', fontWeight: '900', marginBottom: '10px' }}>Từ điển & Dịch thuật Đa năng</h1>
                <p style={{ color: '#64748b', fontSize: '16px' }}>Nhập một đoạn văn để dịch, hoặc nhập một từ để tra cứu từ điển chuyên sâu.</p>
            </div>

            {/* KHU VỰC NHẬP LIỆU (Giống Google Dịch) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', backgroundColor: '#e2e8f0', border: '2px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', marginBottom: '40px' }}>
                
                {/* Ô nguồn */}
                <div style={{ backgroundColor: '#fff', padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '15px' }}>🇺🇸 Tiếng Anh</div>
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Nhập văn bản vào đây..."
                        style={{ width: '100%', minHeight: '150px', border: 'none', outline: 'none', fontSize: '20px', color: '#0f172a', fontFamily: 'Inter', resize: 'none' }}
                    />
                </div>

                {/* Ô đích */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginBottom: '15px' }}>🇻🇳 Tiếng Việt</div>
                    <div style={{ fontSize: '20px', color: '#334155', lineHeight: '1.5' }}>
                        sự dịch thuật, bản dịch
                    </div>
                </div>
            </div>

            {/* KHU VỰC TỪ ĐIỂN CHUYÊN SÂU (Chỉ hiện khi tra 1 từ) */}
            {inputText.split(' ').length === 1 && inputText.length > 0 && (
                <div style={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0', textTransform: 'capitalize' }}>
                                {inputText}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ fontSize: '16px', color: '#64748b' }}>/trænsˈleɪ.ʃən/</span>
                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>noun</span>
                                <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>B1</span>
                            </div>
                        </div>
                        <button style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: 'none', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🔊
                        </button>
                    </div>

                    {/* Nghĩa và Ví dụ */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '18px', color: '#1e293b', fontWeight: '800', marginBottom: '15px' }}>Định nghĩa:</h3>
                        <p style={{ fontSize: '16px', color: '#334155', margin: '0 0 10px 0' }}>
                            1. Công việc chuyển đổi văn bản từ ngôn ngữ này sang ngôn ngữ khác.
                        </p>
                        
                        {/* Khối ví dụ thực tế */}
                        <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '15px', borderRadius: '0 12px 12px 0' }}>
                            <p style={{ fontStyle: 'italic', color: '#0f172a', margin: '0 0 8px 0', fontSize: '15px' }}>
                                "I am looking for remote <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>translation</span> jobs like story translation."
                            </p>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                                (Tôi đang tìm kiếm các công việc dịch thuật từ xa như dịch truyện.)
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                            ➕ Lưu vào Sổ tay Flashcard
                        </button>
                        <button style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                            ✨ Nhờ AI giải thích thêm
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}