import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface Unit { id: string; title: string; languageCode: string; colorHex: string; }
interface Lesson { id: string; unitId: string; title: string; approvalStatus: 'Pending' | 'Approved' | 'Rejected'; isLocked: boolean; lockedById: string | null; }
interface Vocab { id: string; word: string; meaning: string; pronunciation: string; exampleSentence: string; exampleTranslation: string; }

export default function CMCurriculum() {
    // ==========================================
    // 1. STATE DỮ LIỆU
    // ==========================================
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [vocabs, setVocabs] = useState<Vocab[]>([]);
    const [hasEditLock, setHasEditLock] = useState(false);
    
    // FORM INPUTS THÊM MỚI
    const [newUnitTitle, setNewUnitTitle] = useState('');
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newVocab, setNewVocab] = useState({ word: '', meaning: '', pronunciation: '', example: '', exampleVi: '' });

    // STATE CHO INLINE EDIT
    const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
    const [editVocabForm, setEditVocabForm] = useState({ word: '', meaning: '', pronunciation: '', example: '', exampleVi: '' });

    // TOAST VÀ MODAL XÁC NHẬN
    const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const openConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

    // ==========================================
    // 2. EFFECTS
    // ==========================================
    useEffect(() => { loadUnits(); }, []);
    useEffect(() => {
        if (selectedUnit) loadLessons(selectedUnit.id);
        setSelectedLesson(null); setVocabs([]); setHasEditLock(false);
    }, [selectedUnit]);
    useEffect(() => {
        if (selectedLesson) { loadVocabs(selectedLesson.id); setHasEditLock(false); setEditingVocabId(null); }
    }, [selectedLesson]);

    // ==========================================
    // 3. API LẤY DỮ LIỆU
    // ==========================================
    const loadUnits = async () => { try { const res = await apiClient.get<Unit[]>('/cm/cm/units'); setUnits(res.data); } catch (e) {} };
    const loadLessons = async (unitId: string) => { try { const res = await apiClient.get<Lesson[]>(`/cm/cm/units/${unitId}/lessons`); setLessons(res.data); } catch (e) {} };
    const loadVocabs = async (lessonId: string) => { try { const res = await apiClient.get<Vocab[]>(`/cm/cm/lessons/${lessonId}/vocabs`); setVocabs(res.data); } catch (e) {} };

    // ==========================================
    // 4. QUẢN LÝ KHÓA / HỦY KHÓA CHỈNH SỬA
    // ==========================================
    const handleRequestLock = async () => {
        if (!selectedLesson) return;
        try {
            const res = await apiClient.post(`/cm/cm/lessons/${selectedLesson.id}/lock`);
            setHasEditLock(true);
            loadLessons(selectedUnit!.id);
            showToast(res.data.message, 'success');
        } catch (e: any) { showToast(e.response?.data?.message || "Lỗi khóa bài học!", "error"); }
    };

    const handleReleaseLock = () => {
        openConfirm("Hủy phiên chỉnh sửa", "Bạn có chắc chắn muốn nhả khóa bài học này?", async () => {
            try {
                await apiClient.post(`/cm/cm/lessons/${selectedLesson!.id}/unlock`);
                setHasEditLock(false); setEditingVocabId(null); loadLessons(selectedUnit!.id);
                showToast("Đã nhả khóa an toàn!", 'success');
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } catch (e: any) { showToast("Lỗi khi hủy khóa!", "error"); }
        });
    };

    // ==========================================
    // 5. GỬI DUYỆT LẠI (NÚT MỚI)
    // ==========================================
    const handleSubmitForReview = () => {
        openConfirm("Gửi duyệt lại", "Bạn đã chỉnh sửa xong và muốn gửi bài học này lại cho Admin duyệt?", async () => {
            try {
                await apiClient.post(`/cm/cm/lessons/${selectedLesson!.id}/submit-for-review`);
                setHasEditLock(false); 
                setEditingVocabId(null);
                loadLessons(selectedUnit!.id);
                showToast("Đã gửi bài học lại cho Admin thành công!", 'success');
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } catch (e: any) {
                showToast(e.response?.data?.message || "Lỗi gửi duyệt!", "error");
            }
        });
    };

    // ==========================================
    // 6. THÊM / XÓA CHƯƠNG VÀ BÀI HỌC
    // ==========================================
    const handleAddUnit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!newUnitTitle.trim()) return;
        try {
            await apiClient.post('/cm/cm/units', { title: newUnitTitle, languageCode: 'en', colorHex: '#7c3aed' });
            setNewUnitTitle(''); loadUnits(); showToast("Thêm Chương thành công!", 'success');
        } catch (e: any) { showToast(e.response?.data?.message || "Lỗi thêm chương", "error"); }
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault(); if (!selectedUnit || !newLessonTitle.trim()) return;
        try {
            await apiClient.post('/cm/cm/create-lesson', { unitId: selectedUnit.id, title: newLessonTitle, lessonType: 'Vocab' });
            setNewLessonTitle(''); loadLessons(selectedUnit.id); showToast("Thêm Bài học thành công!", 'success');
        } catch (e) { showToast("Lỗi thêm bài học", "error"); }
    };

    const handleDeleteLesson = (e: React.MouseEvent, lessonId: string) => {
        e.stopPropagation();
        openConfirm("Xóa Bài Học", "Bạn có chắc chắn muốn xóa bài học này? Toàn bộ từ vựng bên trong cũng sẽ bị xóa sạch!", async () => {
            try {
                await apiClient.delete(`/cm/cm/lessons/${lessonId}`);
                if (selectedLesson?.id === lessonId) setSelectedLesson(null);
                loadLessons(selectedUnit!.id);
                showToast("Đã xóa bài học thành công!", 'success');
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } catch (e: any) { showToast("Lỗi xóa bài học!", "error"); }
        });
    };

    // ==========================================
    // 7. THÊM / SỬA / XÓA TỪ VỰNG
    // ==========================================
    const handleAddVocab = async (e: React.FormEvent) => {
        e.preventDefault(); if (!selectedLesson || !newVocab.word.trim()) return;
        try {
            await apiClient.post(`/cm/cm/lessons/${selectedLesson.id}/vocabs`, { word: newVocab.word, meaning: newVocab.meaning, pronunciation: newVocab.pronunciation, exampleSentence: newVocab.example, exampleTranslation: newVocab.exampleVi, languageCode: selectedUnit?.languageCode });
            setNewVocab({ word: '', meaning: '', pronunciation: '', example: '', exampleVi: '' });
            loadVocabs(selectedLesson.id); 
            showToast("Thêm từ vựng thành công!", 'success');
        } catch (e: any) { showToast(e.response?.data?.message || "Lỗi thêm từ vựng", "error"); }
    };

    const startEditVocab = (v: Vocab) => {
        setEditingVocabId(v.id); setEditVocabForm({ word: v.word, meaning: v.meaning, pronunciation: v.pronunciation || '', example: v.exampleSentence || '', exampleVi: v.exampleTranslation || '' });
    };

    const handleUpdateVocab = async (e: React.FormEvent, vocabId: string) => {
        e.preventDefault();
        try {
            await apiClient.put(`/cm/cm/lessons/${selectedLesson!.id}/vocabs/${vocabId}`, { word: editVocabForm.word, meaning: editVocabForm.meaning, pronunciation: editVocabForm.pronunciation, exampleSentence: editVocabForm.example, exampleTranslation: editVocabForm.exampleVi, languageCode: selectedUnit?.languageCode });
            setEditingVocabId(null); loadVocabs(selectedLesson!.id); 
            showToast("Đã lưu thay đổi!", 'success');
        } catch (e: any) { showToast("Lỗi cập nhật!", "error"); }
    };

    const handleDeleteVocab = (vocabId: string) => {
        openConfirm("Xóa từ vựng", "Bạn có chắc chắn muốn xóa vĩnh viễn từ vựng này khỏi bài học?", async () => {
            try {
                await apiClient.delete(`/cm/cm/lessons/${selectedLesson!.id}/vocabs/${vocabId}`);
                loadVocabs(selectedLesson!.id); 
                showToast("Đã xóa từ vựng thành công!", 'success');
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } catch (e: any) { showToast("Lỗi xóa từ vựng!", "error"); }
        });
    };

    const getStatusBadge = (status: string) => {
        if (status === 'Approved') return <span className="badge badge-success">✅ Đã duyệt</span>;
        if (status === 'Rejected') return <span className="badge badge-danger">❌ Từ chối</span>;
        return <span className="badge badge-warning">⏳ Chờ duyệt</span>;
    };

    const rejectedLessons = lessons.filter(l => l.approvalStatus === 'Rejected');
    const normalLessons = lessons.filter(l => l.approvalStatus !== 'Rejected');

    return (
        <div style={{ maxWidth: '1500px', margin: '30px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <style>{`
                .layout-container { display: flex; gap: 30px; height: calc(100vh - 120px); align-items: stretch; }
                .sidebar { width: 380px; flex-shrink: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .sidebar-header { padding: 20px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
                .sidebar-content { flex: 1; overflow-y: auto; padding: 15px; }
                
                .unit-item { border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
                .unit-header { padding: 14px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-weight: 700; color: #1e293b; background: #fff; transition: 0.2s; }
                .unit-header:hover { background: #f1f5f9; }
                .unit-header.active { background: #f3e8ff; color: #7c3aed; }
                
                .lesson-list { background: #f8fafc; padding: 10px; }
                .lesson-item { padding: 10px 12px; margin-bottom: 6px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border: 1px solid transparent; font-size: 14px; font-weight: 600; color: #475569; transition: 0.2s; position: relative; }
                .lesson-item:hover { background: #e2e8f0; }
                .lesson-item.active { background: #fff; border-color: #7c3aed; color: #7c3aed; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                
                .lesson-delete-btn { display: none; background: #fee2e2; color: #ef4444; border: none; border-radius: 4px; padding: 4px 6px; cursor: pointer; margin-left: 8px; font-size: 12px; }
                .lesson-item:hover .lesson-delete-btn { display: inline-block; }

                .workspace { flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .workspace-header { padding: 24px 30px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .workspace-content { flex: 1; overflow-y: auto; padding: 30px; background: #f8fafc; }
                
                .badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; white-space: nowrap;}
                .badge-success { background: #dcfce3; color: #166534; }
                .badge-warning { background: #fef3c7; color: #92400e; }
                .badge-danger { background: #fee2e2; color: #991b1b; }
                
                .input-clean { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; box-sizing: border-box; font-family: Inter; }
                .input-clean:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }
                .btn-primary { background: #7c3aed; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
                .btn-primary:hover { background: #6d28d9; }
                
                .vocab-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; position: relative; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .vocab-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .action-btns { position: absolute; top: 15px; right: 15px; display: flex; gap: 5px; opacity: 0; transition: 0.2s; }
                .vocab-card:hover .action-btns { opacity: 1; }
                
                .toast { position: fixed; top: 80px; right: 20px; padding: 16px 24px; border-radius: 12px; color: #fff; font-weight: 800; z-index: 9999; transition: 0.3s; box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
                .toast-show { transform: translateX(0); opacity: 1; }
                .toast-hide { transform: translateX(150%); opacity: 0; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: #fff; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            {/* TOAST THÔNG BÁO */}
            <div className={`toast ${toast.show ? 'toast-show' : 'toast-hide'}`} style={{ backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
                {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
            </div>

            {/* MODAL XÁC NHẬN */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{confirmModal.title}</h2>
                        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5' }}>{confirmModal.message}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Hủy bỏ</button>
                            <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <span style={{ fontSize: '32px' }}>🗂️</span>
                <h1 style={{ color: '#0f172a', margin: 0, fontSize: '24px', fontWeight: '900' }}>Cấu trúc Giáo trình</h1>
            </div>

            <div className="layout-container">
                {/* -------------------- SIDEBAR BÊN TRÁI -------------------- */}
                <div className="sidebar">
                    <div className="sidebar-header">
                        <form onSubmit={handleAddUnit} style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" className="input-clean" placeholder="Tên chương mới..." value={newUnitTitle} onChange={e => setNewUnitTitle(e.target.value)} />
                            <button type="submit" className="btn-primary" style={{ padding: '10px 15px' }}>+</button>
                        </form>
                    </div>
                    
                    <div className="sidebar-content">
                        {units.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>Chưa có chương nào.</div>}
                        {units.map(u => (
                            <div key={u.id} className="unit-item">
                                <div className={`unit-header ${selectedUnit?.id === u.id ? 'active' : ''}`} onClick={() => setSelectedUnit(selectedUnit?.id === u.id ? null : u)}>
                                    <span>📁 [{u.languageCode.toUpperCase()}] {u.title}</span> 
                                    <span>{selectedUnit?.id === u.id ? '▼' : '▶'}</span>
                                </div>
                                
                                {selectedUnit?.id === u.id && (
                                    <div className="lesson-list">
                                        {/* NHÓM BÀI HỌC BỊ TỪ CHỐI */}
                                        {rejectedLessons.length > 0 && (
                                            <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px', marginBottom: '10px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#991b1b', marginBottom: '5px' }}>⚠️ Cần xử lý ({rejectedLessons.length})</div>
                                                {rejectedLessons.map(l => (
                                                    <div key={l.id} className={`lesson-item ${selectedLesson?.id === l.id ? 'active' : ''}`} onClick={() => setSelectedLesson(l)} style={{ background: '#fff', border: '1px solid #fca5a5' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                            <span>{l.isLocked && selectedLesson?.id !== l.id ? '🔒' : '📄'}</span> 
                                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            {getStatusBadge(l.approvalStatus)}
                                                            <button className="lesson-delete-btn" onClick={(e) => handleDeleteLesson(e, l.id)}>🗑️</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* NHÓM BÀI HỌC BÌNH THƯỜNG */}
                                        {normalLessons.map(l => (
                                            <div key={l.id} className={`lesson-item ${selectedLesson?.id === l.id ? 'active' : ''}`} onClick={() => setSelectedLesson(l)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                    <span>{l.isLocked && selectedLesson?.id !== l.id ? '🔒' : '📄'}</span> 
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {getStatusBadge(l.approvalStatus)}
                                                    <button className="lesson-delete-btn" title="Xóa bài học" onClick={(e) => handleDeleteLesson(e, l.id)}>🗑️</button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {/* FORM TẠO BÀI HỌC MỚI */}
                                        <form onSubmit={handleAddLesson} style={{ marginTop: '10px', display: 'flex', gap: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                                            <input type="text" className="input-clean" placeholder="Tên bài học mới..." style={{ padding: '8px', fontSize: '13px' }} value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} />
                                            <button type="submit" className="btn-primary" style={{ padding: '8px 12px', fontSize: '13px', background: '#3b82f6' }}>Tạo</button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* -------------------- WORKSPACE BÊN PHẢI -------------------- */}
                <div className="workspace">
                    {!selectedLesson ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.5 }}>📝</div>
                            <h2 style={{ color: '#475569', margin: '0 0 10px 0' }}>Không gian thao tác</h2>
                            <p style={{ fontSize: '15px' }}>Vui lòng mở một Chương và chọn Bài học ở menu bên trái để bắt đầu chỉnh sửa.</p>
                        </div>
                    ) : (
                        <>
                            <div className="workspace-header">
                                <div>
                                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>{selectedUnit?.title}</div>
                                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {selectedLesson.title} {getStatusBadge(selectedLesson.approvalStatus)}
                                    </h2>
                                </div>
                                
                                {/* NÚT HÀNH ĐỘNG GÓC PHẢI */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    
                                    {/* 👉 NÚT GỬI DUYỆT LẠI (Chỉ hiện khi bài bị Từ chối hoặc Chờ duyệt mà vừa sửa xong) */}
                                    {(selectedLesson.approvalStatus === 'Rejected' || selectedLesson.approvalStatus === 'Pending') && (
                                        <button 
                                            onClick={handleSubmitForReview} 
                                            className="btn-primary" 
                                            style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            title="Gửi bài học này lên Admin để duyệt lại"
                                        >
                                            <span>📤</span> Gửi duyệt lại
                                        </button>
                                    )}

                                    {!hasEditLock ? (
                                        <button onClick={handleRequestLock} className="btn-primary" style={{ background: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🔑</span> Mở khóa để Chỉnh sửa
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleReleaseLock} 
                                            style={{ padding: '8px 16px', background: '#dcfce3', color: '#166534', border: '1px solid #86efac', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }} 
                                            title="Nhấn để thoát chế độ sửa và nhả khóa"
                                        >
                                            <span>🔓</span> Đang sửa (Nhấn để Hủy)
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="workspace-content">
                                {/* FORM THÊM TỪ VỰNG MỚI */}
                                {hasEditLock && (
                                    <form onSubmit={handleAddVocab} style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '16px' }}>✨ Thêm từ vựng mới</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>Từ vựng gốc *</label>
                                                <input type="text" className="input-clean" placeholder="Ví dụ: Hello..." value={newVocab.word} onChange={e => setNewVocab({...newVocab, word: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>Nghĩa Tiếng Việt *</label>
                                                <input type="text" className="input-clean" placeholder="Ví dụ: Xin chào..." value={newVocab.meaning} onChange={e => setNewVocab({...newVocab, meaning: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>Phiên âm</label>
                                                <input type="text" className="input-clean" placeholder="/həˈləʊ/" value={newVocab.pronunciation} onChange={e => setNewVocab({...newVocab, pronunciation: e.target.value})} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>Ví dụ (Tiếng Anh)</label>
                                                <input type="text" className="input-clean" placeholder="Hello, how are you?" value={newVocab.example} onChange={e => setNewVocab({...newVocab, example: e.target.value})} />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>Dịch nghĩa Ví dụ</label>
                                                <input type="text" className="input-clean" placeholder="Xin chào, bạn khỏe không?" value={newVocab.exampleVi} onChange={e => setNewVocab({...newVocab, exampleVi: e.target.value})} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button type="submit" className="btn-primary">Lưu Từ vựng</button>
                                        </div>
                                    </form>
                                )}

                                {/* DANH SÁCH TỪ VỰNG TỒN TẠI */}
                                <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '18px' }}>Danh sách Từ vựng ({vocabs.length})</h3>
                                {vocabs.length === 0 ? (
                                    <p style={{ color: '#94a3b8' }}>Chưa có từ vựng nào trong bài học này.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                                        {vocabs.map(v => (
                                            editingVocabId === v.id ? (
                                                <form key={v.id} onSubmit={(e) => handleUpdateVocab(e, v.id)} style={{ background: '#fff', border: '2px solid #7c3aed', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.1)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                                        <input type="text" className="input-clean" placeholder="Từ vựng" value={editVocabForm.word} onChange={e => setEditVocabForm({...editVocabForm, word: e.target.value})} required />
                                                        <input type="text" className="input-clean" placeholder="Nghĩa TV" value={editVocabForm.meaning} onChange={e => setEditVocabForm({...editVocabForm, meaning: e.target.value})} required />
                                                        <input type="text" className="input-clean" placeholder="Phiên âm" value={editVocabForm.pronunciation} onChange={e => setEditVocabForm({...editVocabForm, pronunciation: e.target.value})} />
                                                        <input type="text" className="input-clean" placeholder="Ví dụ" value={editVocabForm.example} onChange={e => setEditVocabForm({...editVocabForm, example: e.target.value})} />
                                                        <input type="text" className="input-clean" style={{ gridColumn: '1 / -1' }} placeholder="Dịch ví dụ" value={editVocabForm.exampleVi} onChange={e => setEditVocabForm({...editVocabForm, exampleVi: e.target.value})} />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        <button type="button" onClick={() => setEditingVocabId(null)} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
                                                        <button type="submit" style={{ padding: '8px 16px', background: '#10b981', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Lưu thay đổi</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div key={v.id} className="vocab-card">
                                                    {hasEditLock && (
                                                        <div className="action-btns">
                                                            <button onClick={() => startEditVocab(v)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#3b82f6', fontSize: '15px' }} title="Chỉnh sửa">✏️</button>
                                                            <button onClick={() => handleDeleteVocab(v.id)} style={{ background: '#fee2e2', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', fontSize: '15px' }} title="Xóa">🗑️</button>
                                                        </div>
                                                    )}
                                                    
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>
                                                                {v.word} <span style={{ color: '#7c3aed', fontSize: '13px', background: '#f3e8ff', padding: '4px 8px', borderRadius: '6px', marginLeft: '5px' }}>{v.pronunciation || 'N/A'}</span>
                                                            </div>
                                                            <div style={{ color: '#10b981', fontWeight: '800', fontSize: '15px', marginBottom: '10px' }}>{v.meaning}</div>
                                                        </div>
                                                    </div>
                                                    {v.exampleSentence && (
                                                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #cbd5e1', fontSize: '14px', marginTop: '10px' }}>
                                                            <div style={{ color: '#334155', fontStyle: 'italic', marginBottom: '4px' }}>"{v.exampleSentence}"</div>
                                                            <div style={{ color: '#64748b' }}>{v.exampleTranslation}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}