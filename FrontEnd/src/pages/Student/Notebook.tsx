import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface Flashcard {
    id: string;
    targetWord: string;
    translation: string;
    nextReviewDate: string;
    intervalDays: number;
    isDue: boolean; // Trạng thái cần ôn tập gấp
}

export default function Notebook() {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // State lưu trữ id của thẻ đang bị lật (để biết lật thẻ nào)
    const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                const response = await apiClient.get<Flashcard[]>('/user/student/flashcard');
                setCards(response.data);
            } catch (err) {
                console.error(err);
                setError('Không thể tải Sổ tay từ vựng.');
            } finally {
                setLoading(false);
            }
        };
        fetchFlashcards();
    }, []);

    // Hàm xử lý lật thẻ
    const toggleFlip = (id: string) => {
        setFlippedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#afafaf' }}>⏳ Đang mở Sổ tay...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '100px', color: '#ff4b4b', fontWeight: 'bold' }}>{error}</div>;

    const dueCount = cards.filter(c => c.isDue).length;

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            {/* CSS Tùy chỉnh cho hiệu ứng lật thẻ 3D */}
            <style>{`
                .card-container {
                    perspective: 1000px;
                    cursor: pointer;
                    height: 200px;
                }
                .card-inner {
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
                    transform-style: preserve-3d;
                    position: relative;
                }
                .card-container.flipped .card-inner {
                    transform: rotateY(180deg);
                }
                .card-front, .card-back {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    backface-visibility: hidden;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    box-shadow: 0 8px 0 rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,0.5);
                    border: 2px solid #e5e5e5;
                }
                .card-front {
                    background-color: #fff;
                }
                .card-back {
                    background-color: #f7f7f7;
                    transform: rotateY(180deg);
                    border-color: #1cb0f6;
                }
                .badge {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    padding: 6px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .badge-due { background-color: #ffefef; color: #ff4b4b; border: 2px solid #ff4b4b; }
                .badge-good { background-color: #f0fad4; color: #58cc02; border: 2px solid #58cc02; }
            `}</style>

            {/* HEADER SỔ TAY */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#4b4b4b', fontWeight: '900', margin: '0 0 10px 0' }}>Sổ tay Từ vựng</h1>
                    <p style={{ color: '#777', margin: 0, fontSize: '16px', fontWeight: '500' }}>
                        Bạn có tổng cộng <strong style={{ color: '#1cb0f6' }}>{cards.length}</strong> từ vựng đã lưu.
                    </p>
                </div>
                {dueCount > 0 && (
                    <div style={{ backgroundColor: '#ff4b4b', color: '#fff', padding: '12px 20px', borderRadius: '16px', fontWeight: '800', boxShadow: '0 4px 0 #cc0000' }}>
                        🔥 {dueCount} từ cần ôn tập ngay!
                    </div>
                )}
            </div>

            {/* GRID HIỂN THỊ CÁC THẺ FLASHCARD */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                {cards.map((card) => {
                    const isFlipped = flippedCards[card.id] || false;

                    return (
                        <div key={card.id} className={`card-container ${isFlipped ? 'flipped' : ''}`} onClick={() => toggleFlip(card.id)}>
                            <div className="card-inner">
                                
                                {/* MẶT TRƯỚC: Tiếng Anh */}
                                <div className="card-front">
                                    <div className={`badge ${card.isDue ? 'badge-due' : 'badge-good'}`}>
                                        {card.isDue ? '⏳ Tới hạn ôn' : '✅ Đã thuộc'}
                                    </div>
                                    <h2 style={{ fontSize: '28px', color: '#4b4b4b', fontWeight: '900', margin: '0 0 10px 0', textAlign: 'center' }}>
                                        {card.targetWord}
                                    </h2>
                                    <span style={{ color: '#afafaf', fontWeight: 'bold', fontSize: '14px' }}>Bấm để xem nghĩa</span>
                                </div>

                                {/* MẶT SAU: Tiếng Việt */}
                                <div className="card-back">
                                    <h2 style={{ fontSize: '24px', color: '#1cb0f6', fontWeight: '900', margin: '0 0 15px 0', textAlign: 'center' }}>
                                        {card.translation}
                                    </h2>
                                    {card.intervalDays > 0 && (
                                        <div style={{ fontSize: '14px', color: '#777', fontWeight: '600', backgroundColor: '#fff', padding: '8px 16px', borderRadius: '12px', border: '2px solid #e5e5e5' }}>
                                            Chu kỳ: Lặp lại mỗi {card.intervalDays} ngày
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}