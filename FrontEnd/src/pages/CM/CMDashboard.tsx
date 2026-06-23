import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function CMDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalCourses: 0, pendingQna: 0, recentVocabs: 0 });
    const [managedLang, setManagedLang] = useState('Đang tải...');
    const [loading, setLoading] = useState(true);

    const getLangLabel = (code: string) => {
        if (code === 'en') return 'Tiếng Anh 🇬🇧';
        if (code === 'ja') return 'Tiếng Nhật 🇯🇵';
        if (code === 'zh') return 'Tiếng Trung 🇨🇳';
        if (code === 'all') return 'Toàn quyền (Global) 🌐';
        return 'Không xác định';
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 👉 GỌI API LẤY NGÔN NGỮ QUẢN LÝ
                const profileRes = await apiClient.get('/user/student/profile');
                if (profileRes.data) {
                    setManagedLang(getLangLabel(profileRes.data.managedLanguage));
                }

                const qnaRes = await apiClient.get<any[]>('/cm/qna/pending');
                setStats({ totalCourses: 6, pendingQna: qnaRes.data.length, recentVocabs: 124 });
            } catch (error) { console.error("Lỗi lấy data Dashboard"); } 
            finally { setLoading(false); }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', color: '#64748b' }}>⏳ Đang tải bảng điều khiển...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '28px', fontWeight: '900' }}>👋 Chào mừng trở lại, Biên tập viên!</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>Đây là tổng quan tình hình nội dung của hệ thống hôm nay.</p>
                </div>
                <div style={{ backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>
                    Phân quyền: <span style={{ color: '#10b981' }}>{managedLang}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px' }}>📚</div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Tổng số Chương (Units)</div>
                        <div style={{ color: '#0f172a', fontSize: '28px', fontWeight: '900' }}>{stats.totalCourses}</div>
                    </div>
                </div>
                <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px' }}>💬</div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Q&A Đang chờ</div>
                        <div style={{ color: '#ef4444', fontSize: '28px', fontWeight: '900' }}>{stats.pendingQna}</div>
                    </div>
                </div>
                <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px' }}>📝</div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Từ vựng đã thêm tuần này</div>
                        <div style={{ color: '#0f172a', fontSize: '28px', fontWeight: '900' }}>{stats.recentVocabs}</div>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: '800', marginBottom: '20px' }}>⚡ Lối tắt nhanh</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px' }}>
                <div onClick={() => navigate('/cm/curriculum')} style={{ backgroundColor: '#7c3aed', color: '#fff', borderRadius: '20px', padding: '30px', cursor: 'pointer', transition: 'filter 0.2s' }} onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                    <div style={{ fontSize: '40px', marginBottom: '15px' }}>🏗️</div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900' }}>Xây dựng Giáo trình</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '15px', lineHeight: '1.5' }}>Quản lý nội dung cho phân vùng: <b>{managedLang}</b>.</p>
                </div>
                <div onClick={() => navigate('/cm/qna')} style={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '20px', padding: '30px', cursor: 'pointer', transition: 'border-color 0.2s, background-color 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.backgroundColor = '#fffbeb'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#fff'; }}>
                    <div style={{ fontSize: '40px', marginBottom: '15px' }}>💌</div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Giải đáp Học viên</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>Kiểm tra hòm thư và giải thích các thắc mắc về Ngữ pháp/Từ vựng cho học viên.</p>
                    {stats.pendingQna > 0 && <div style={{ display: 'inline-block', marginTop: '15px', padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Có {stats.pendingQna} câu hỏi chưa trả lời</div>}
                </div>
            </div>

        </div>
    );
}