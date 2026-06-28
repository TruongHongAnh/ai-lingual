import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface Lesson {
    id: string;
    name: string;
    status: 'completed' | 'active' | 'locked';
    xp: number;
}

interface Unit {
    id: string;
    title: string;
    desc: string;
    color: string;
    lessons: Lesson[];
}

interface ActiveModal extends Lesson {
    unitColor: string;
}

export default function LearningPath() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const lang = searchParams.get('lang') || 'en';

    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
    const activeLessonRef = useRef<HTMLDivElement | null>(null);
    
    // 👉 State quản lý Nút cuộn (Lên / Xuống / Ẩn)
    const [jumpDirection, setJumpDirection] = useState<'up' | 'down' | 'none'>('none');

    // 1. Gọi API Lộ trình
    useEffect(() => {
        const loadLearningPath = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await apiClient.get<Unit[]>(`/user/student/learning-path?lang=${lang}`);
                setUnits(response.data);
            } catch (err: unknown) {
                console.error(err);
                setError('Không thể tải lộ trình học từ máy chủ.');
            } finally {
                setLoading(false);
            }
        };
        loadLearningPath();
    }, [lang]);

    // 2. Logic tính toán vị trí để hiện Nút Mũi Tên
    useEffect(() => {
        const handleScroll = () => {
            if (!activeLessonRef.current) return;
            const rect = activeLessonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

            // Nếu bài học bị cuộn khuất lên trên -> Hiện mũi tên LÊN
            if (rect.bottom < 0) {
                setJumpDirection('up');
            } 
            // Nếu bài học bị cuộn khuất xuống dưới -> Hiện mũi tên XUỐNG
            else if (rect.top > viewportHeight) {
                setJumpDirection('down');
            } 
            // Nếu đang nhìn thấy bài học -> Ẩn mũi tên
            else {
                setJumpDirection('none');
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Chạy lần đầu sau 0.5s để đợi render DOM
        setTimeout(handleScroll, 500); 

        return () => window.removeEventListener('scroll', handleScroll);
    }, [units, loading]);

    // 3. Auto-scroll lần đầu load trang
    useEffect(() => {
        if (!loading && activeLessonRef.current) {
            setTimeout(() => {
                activeLessonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [loading, units]);

    // Hàm thực thi khi bấm nút Mũi Tên
    const jumpToActiveLesson = () => {
        activeLessonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // 👉 SVG ICONS ĐỂ NÚT ĐẸP VÀ SẮC NÉT
    const StarIcon = <svg width="34" height="34" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
    const CheckIcon = <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

    // 👉 VẼ NÚT MỚI: 3D, MÀU ĐỘNG, ICON SVG
    const renderNode = (status: 'completed' | 'active' | 'locked', isRef: boolean, unitColor: string) => {
        if (status === 'completed') {
            return (
                <div className="node-3d node-clickable" style={{ backgroundColor: unitColor }}>
                    {CheckIcon}
                </div>
            );
        }
        if (status === 'active') {
            return (
                <div ref={isRef ? activeLessonRef : null} className="node-active-wrapper">
                    <div className="tooltip-bounce" style={{ color: unitColor }}>
                        BẮT ĐẦU
                        <div className="tooltip-arrow-outer"></div>
                        <div className="tooltip-arrow-inner"></div>
                    </div>
                    {/* Vòng xám bọc ngoài */}
                    <div className="node-active-ring">
                        {/* Nút màu bên trong */}
                        <div className="node-3d node-clickable" style={{ backgroundColor: unitColor }}>
                            {StarIcon}
                        </div>
                    </div>
                </div>
            );
        }
        return (
            // Nút Khóa: Màu Xám
            <div className="node-3d node-locked" style={{ backgroundColor: '#e5e5e5' }}>
                {StarIcon}
            </div>
        );
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#afafaf' }}>⏳ Đang tải lộ trình...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '100px', color: '#ff4b4b', fontWeight: 'bold' }}>{error}</div>;

    const getOffset = (index: number) => {
        const pattern = [0, 45, 75, 45, 0, -45, -75, -45];
        return pattern[index % pattern.length];
    };

    return (
        <div style={{ maxWidth: '1350px', margin: '30px auto', padding: '0 30px', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
            
            <style>
                {`
                    @keyframes bounce { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -8px); } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    
                    /* Menu Trái */
                    .sidebar-item { padding: 12px 16px; border-radius: 12px; color: #777; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 15px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: background-color 0.2s; border: 2px solid transparent; }
                    .sidebar-item:hover { background-color: #f7f7f7; }
                    .sidebar-item.active { background-color: #ddf4ff; color: #1cb0f6; border: 2px solid #84d8ff; }

                    /* 👉 CSS NÚT 3D MỚI */
                    .node-3d { width: 75px; height: 75px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 8px 0 rgba(0,0,0,0.15), inset 0 5px 0 rgba(255,255,255,0.3); transition: transform 0.1s, filter 0.2s, box-shadow 0.1s; position: relative; overflow: hidden; }
                    .node-clickable { cursor: pointer; }
                    .node-clickable:hover { filter: brightness(1.08); transform: scale(1.03); }
                    .node-clickable:active { transform: translateY(8px); box-shadow: inset 0 5px 0 rgba(255,255,255,0.3); } /* Lún xuống mất bóng đen */
                    
                    /* Node Đang học */
                    .node-active-wrapper { position: relative; z-index: 10; display: inline-block; }
                    .tooltip-bounce { position: absolute; top: -65px; left: 50%; transform: translateX(-50%); background-color: #fff; border: 2px solid #e5e5e5; padding: 10px 16px; border-radius: 12px; font-weight: 900; font-size: 15px; letter-spacing: 1px; animation: bounce 2s infinite; box-shadow: 0 4px 10px rgba(0,0,0,0.05); z-index: 11; }
                    .tooltip-arrow-outer { position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); border-width: 10px 10px 0; border-style: solid; border-color: #e5e5e5 transparent transparent transparent; }
                    .tooltip-arrow-inner { position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); border-width: 8px 8px 0; border-style: solid; border-color: #fff transparent transparent transparent; }
                    .node-active-ring { padding: 12px; border-radius: 50%; background-color: #f7f7f7; display: flex; justify-content: center; align-items: center; } /* Vòng xám bọc ngoài y như thật */

                    /* Node Xám (Khóa) */
                    .node-locked { opacity: 0.9; cursor: not-allowed; box-shadow: 0 8px 0 rgba(0,0,0,0.05), inset 0 5px 0 rgba(255,255,255,0.5); }
                    .node-locked svg { filter: grayscale(1) opacity(0.8); }

                    /* Button chung */
                    .btn-guide { display: flex; align-items: center; gap: 8px; background-color: transparent; border: 2px solid rgba(255,255,255,0.4); border-radius: 16px; padding: 10px 18px; color: #fff; font-weight: 800; cursor: pointer; font-size: 14px; text-transform: uppercase; transition: background-color 0.2s; }
                    .btn-guide:hover { background-color: rgba(255,255,255,0.2); }

                    .btn-gray { width: 100%; margin-top: 15px; padding: 15px; background-color: transparent; color: #afafaf; border: none; font-weight: 800; font-size: 15px; cursor: pointer; text-transform: uppercase; transition: color 0.2s; }
                    .btn-gray:hover { color: #777; }

                    .btn-dynamic { width: 100%; padding: 16px; color: #fff; border: none; border-radius: 16px; font-weight: 900; font-size: 16px; text-transform: uppercase; cursor: pointer; transition: filter 0.2s, transform 0.1s, box-shadow 0.1s; box-shadow: 0 4px 0 rgba(0,0,0,0.15); }
                    .btn-dynamic:hover { filter: brightness(1.1); }
                    .btn-dynamic:active { transform: translateY(4px); box-shadow: none; }

                    .text-link { font-size: 14px; color: #1cb0f6; font-weight: 800; cursor: pointer; text-transform: uppercase; transition: filter 0.2s; }
                    .text-link:hover { filter: brightness(1.2); }

                    /* Nút Jump (Mũi tên bay về) */
                    /* Nút Jump (Mũi tên bay về) ĐÃ FIX VỊ TRÍ */
                    .jump-btn { 
                        position: fixed; 
                        bottom: 30px; 
                        /* 👉 Sửa dòng này: Căn từ giữa màn hình đẩy sang phải 160px */
                        left: calc(50% + 160px); 
                        width: 55px; 
                        height: 55px; 
                        background-color: #fff; 
                        border: 2px solid #e5e5e5; 
                        border-radius: 50%; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        cursor: pointer; 
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
                        transition: transform 0.2s, border-color 0.2s; 
                        z-index: 100; 
                    }
                    .jump-btn:hover { border-color: #1cb0f6; transform: scale(1.1); }
                    .jump-btn svg { stroke: #1cb0f6; }
                `}
            </style>
            
            {/* 👉 NÚT BAY VỀ BÀI ĐANG HỌC (JUMP BUTTON) */}
            {jumpDirection !== 'none' && (
                <div className="jump-btn" onClick={jumpToActiveLesson}>
                    {jumpDirection === 'up' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 320px', gap: '80px' }}>
                
                {/* ================= CỘT 1: MENU BÊN TRÁI ================= */}
                <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '8px', height: 'fit-content' }}>
                    <div className="sidebar-item active">
                        <span style={{ fontSize: '26px' }}>🏠</span> HỌC
                    </div>
                    <div className="sidebar-item">
                        <span style={{ fontSize: '26px' }}>あ</span> CHỮ CÁI
                    </div>
                    <div className="sidebar-item">
                        <span style={{ fontSize: '26px' }}>🛡️</span> BẢNG XẾP HẠNG
                    </div>
                    <div className="sidebar-item">
                        <span style={{ fontSize: '26px' }}>🎯</span> NHIỆM VỤ
                    </div>
                    <div className="sidebar-item">
                        <span style={{ fontSize: '26px' }}>🏪</span> CỬA HÀNG
                    </div>
                    <div className="sidebar-item" onClick={() => navigate('/student/profile')}>
                        <span style={{ fontSize: '26px' }}>👧</span> HỒ SƠ
                    </div>
                    <div className="sidebar-item">
                        <span style={{ fontSize: '26px' }}>💬</span> XEM THÊM
                    </div>
                </div>

                {/* ================= CỘT 2: LỘ TRÌNH CHÍNH ================= */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '100px' }}>
                    {units.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#afafaf', padding: '40px', border: '2px dashed #e5e5e5', borderRadius: '16px' }}>Database đang trống!</div>
                    ) : (
                        units.map((unit, uIndex) => (
                            <div key={unit.id} style={{ width: '100%', maxWidth: '600px', marginBottom: '40px' }}>
                                
                                <div style={{ backgroundColor: unit.color, borderRadius: '20px', padding: '20px 24px', color: '#fff', marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '800', opacity: 0.9, marginBottom: '6px', letterSpacing: '1px' }}>
                                            ← PHẦN {uIndex + 1}, CỬA 1
                                        </div>
                                        <div style={{ fontSize: '22px', fontWeight: '900' }}>{unit.title}</div>
                                    </div>
                                    <button className="btn-guide">
                                        <span style={{ fontSize: '16px' }}>📋</span> Hướng dẫn
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                                    {unit.lessons.map((lesson, lIndex) => {
                                        const isLocked = lesson.status === 'locked';
                                        const isActive = lesson.status === 'active';
                                        const offset = getOffset(lIndex);

                                        return (
                                            <div 
                                                key={lesson.id} 
                                                onClick={() => !isLocked && setActiveModal({ ...lesson, unitColor: unit.color })}
                                                style={{ transform: `translateX(${offset}px)` }}
                                            >
                                                {/* TRUYỀN MÀU CỦA CHƯƠNG VÀO NÚT */}
                                                {renderNode(lesson.status, isActive, unit.color)}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ height: '2px', backgroundColor: '#e5e5e5', margin: '60px auto 0 auto', width: '80%' }}></div>
                            </div>
                        ))
                    )}
                </div>

                {/* ================= CỘT 3: WIDGETS BÊN PHẢI ================= */}
                <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '24px' }}>🇺🇸</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#e5e5e5', fontSize: '16px' }}><span>🔥</span> 0</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#1cb0f6', fontSize: '16px' }}><span>💎</span> 500</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#ff4b4b', fontSize: '16px' }}><span>❤️</span> 5</div>
                    </div>

                    <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#4b4b4b', fontWeight: '800' }}>Mở khóa Bảng xếp hạng!</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#e5e5e5', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', flexShrink: 0 }}>🔒</div>
                            <div style={{ color: '#777', fontSize: '15px', fontWeight: '500', lineHeight: '1.5' }}>
                                Hoàn thành thêm 3 bài học để bắt đầu thi đua
                            </div>
                        </div>
                    </div>

                    <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, fontSize: '17px', color: '#4b4b4b', fontWeight: '800' }}>Nhiệm vụ hằng ngày</h3>
                            <span className="text-link">Xem tất cả</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ fontSize: '32px' }}>⚡</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#4b4b4b' }}>Kiếm 10 KN</div>
                                        <div style={{ fontWeight: '800', color: '#afafaf', fontSize: '15px' }}>0 / 10</div>
                                    </div>
                                    <div style={{ height: '16px', backgroundColor: '#e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ width: '0%', height: '100%', backgroundColor: '#ffc800' }}></div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '28px', color: '#cecece' }}>🎁</div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ fontSize: '32px' }}>⏱️</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#4b4b4b' }}>Học trong 5 phút</div>
                                        <div style={{ fontWeight: '800', color: '#afafaf', fontSize: '15px' }}>0 / 5</div>
                                    </div>
                                    <div style={{ height: '16px', backgroundColor: '#e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ width: '0%', height: '100%', backgroundColor: '#1cb0f6' }}></div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '28px', color: '#cecece' }}>🎁</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ border: '2px solid #e5e5e5', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#4b4b4b', fontWeight: '800' }}>Tạo hồ sơ để lưu tiến trình!</h3>
                        <button className="btn-dynamic" style={{ backgroundColor: '#58cc02' }}>
                            Tạo hồ sơ
                        </button>
                    </div>

                </div>
            </div>

            {/* ================= MODAL HIỂN THỊ KHI CLICK VÀO BÀI HỌC ================= */}
            {activeModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '30px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease-out' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: '#4b4b4b', fontSize: '22px', fontWeight: '900' }}>{activeModal.name}</h2>
                        <p style={{ color: '#afafaf', marginBottom: '25px', fontWeight: 'bold', fontSize: '16px' }}>Phần thưởng: +{activeModal.xp} XP</p>

                        <button 
                            className="btn-dynamic"
                            onClick={() => navigate('/student/lesson/' + activeModal.id)} 
                            style={{ backgroundColor: activeModal.status === 'completed' ? '#1cb0f6' : activeModal.unitColor }}
                        >
                            {activeModal.status === 'completed' ? '🔄 Ôn tập lại' : '▶ Bắt đầu học'}
                        </button>

                        <button onClick={() => setActiveModal(null)} className="btn-gray">
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}