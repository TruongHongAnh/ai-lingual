import { useState } from 'react';
import apiClient from '../../services/apiClient';
import { getUserId } from '../../utils/auth';

interface AiGrammarResponse {
    original: string;
    corrected: string;
    explanation: string;
}

export default function AiPractice() {
    const [text, setText] = useState<string>('');
    const [result, setResult] = useState<AiGrammarResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleCheckGrammar = async () => {
        if (!text.trim()) return;
        
        const userId = getUserId();
        if (!userId) {
            alert("Lỗi xác thực: Không tìm thấy ID người dùng!");
            return;
        }

        setLoading(true);
        try {
            // Lấy ID thật sự từ Token ném xuống Database
            const response = await apiClient.post<AiGrammarResponse>('/user/student/ai-grammar-check', {
                userId: userId, 
                text: text
            });
            setResult(response.data);
        } catch (err) {
            alert('Lỗi khi gọi AI. Vui lòng kiểm tra Server C#.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>🤖 Trợ lý AI Động (Real DB)</h3>
            
            <textarea 
                rows={4} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                value={text} 
                onChange={e => setText(e.target.value)}
                placeholder="Nhập câu tiếng Anh... (Thử gõ: I eat a apple yesterday)"
            />
            
            <button 
                onClick={handleCheckGrammar} 
                disabled={loading}
                style={{ marginTop: '12px', padding: '12px 24px', background: '#0284c7', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
                {loading ? 'Đang phân tích và trừ Token trong DB...' : '✨ Sửa lỗi ngay'}
            </button>

            {result && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ AI sửa: {result.corrected}</p>
                    <p>💡 Giải thích: {result.explanation}</p>
                </div>
            )}
        </div>
    );
}