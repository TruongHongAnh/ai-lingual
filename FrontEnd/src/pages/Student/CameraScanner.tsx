import React, { useRef, useState, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import apiClient from '../../services/apiClient';

// Giao diện dữ liệu cho 1 TỪ VỰNG
interface WordDetail {
    english: string;
    vietnamese: string;
    phonetic: string;
    type: string;
    level?: string; 
}

// Giao diện dữ liệu cho 1 LẦN QUÉT (Chứa ảnh gốc + danh sách từ)
interface ScanRecord {
    id: string;
    imageSrc: string; // Ảnh cắt dưới dạng Base64 để hiển thị
    status: 'loading' | 'success' | 'error';
    words: WordDetail[];
}

export default function CameraScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
    const currentPredictions = useRef<cocoSsd.DetectedObject[]>([]);

    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    
    // ĐỔI STATE: Lưu trữ Lịch sử Quét (thay vì list từ vựng phẳng)
    const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);

    // 1. Tải mô hình AI
    useEffect(() => {
        const loadModel = async () => {
            try {
                const model = await cocoSsd.load();
                modelRef.current = model;
                setIsModelLoaded(true);
            } catch (err) {
                console.error("Lỗi tải AI Model:", err);
            }
        };
        loadModel();
        return () => stopCamera();
    }, []);

    // 2. Điều khiển Camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraOpen(true);
            }
        } catch (err) {
            alert("Không thể truy cập camera!");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsCameraOpen(false);
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };

    // 3. Vòng lặp vẽ khung xanh Edge AI
    const detectFrame = async () => {
        if (!videoRef.current || !canvasRef.current || !modelRef.current || !isCameraOpen) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const predictions = await modelRef.current.detect(video);
            currentPredictions.current = predictions;
            renderPredictions(predictions, canvas);
        }
        requestAnimationFrame(detectFrame);
    };

    const renderPredictions = (predictions: cocoSsd.DetectedObject[], canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Inter, Arial';
        ctx.textBaseline = 'top';
        ctx.lineWidth = 3;

        predictions.forEach(prediction => {
            if (prediction.score > 0.5) {
                const [x, y, width, height] = prediction.bbox;
                ctx.strokeStyle = '#0ea5e9'; 
                ctx.fillStyle = '#0ea5e9';
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.stroke();

                const textWidth = ctx.measureText(prediction.class).width;
                const textHeight = 24;
                ctx.fillRect(x, y - textHeight, textWidth + 10, textHeight);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(prediction.class, x + 5, y - textHeight + 4);
            }
        });
    };

    // ==========================================
    // 4. XỬ LÝ CLICK: TẠO RECORD GỒM CẢ ẢNH & TỪ
    // ==========================================
    // ==========================================
    // 4. XỬ LÝ CLICK: TẠO HỒNG TÂM LA-ZE TRÊN ẢNH
    // ==========================================
    const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        if (!canvasRef.current || !videoRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Tọa độ click trên màn hình hiển thị
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Lấy kích thước gốc (Native Resolution) của Video
        const videoNativeWidth = video.videoWidth;
        const videoNativeHeight = video.videoHeight;

        // Tính toán tỷ lệ bù trừ Aspect Ratio để ánh xạ tọa độ click vào ảnh gốc
        const scaleX = videoNativeWidth / rect.width;
        const scaleY = videoNativeHeight / rect.height;
        const nativeClickX = clickX * scaleX;
        const nativeClickY = clickY * scaleY;

        const tempId = Math.random().toString();

        // Tạo Canvas ảo với kích thước Full HD của Camera
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = videoNativeWidth;
        cropCanvas.height = videoNativeHeight;
        const cropCtx = cropCanvas.getContext('2d');
        
        if (cropCtx) {
            // 1. Chụp lại toàn bộ khung cảnh
            cropCtx.drawImage(video, 0, 0, videoNativeWidth, videoNativeHeight);

            // 2. Vẽ một "Hồng tâm" (Target) màu đỏ ngay tại điểm Click
            cropCtx.beginPath();
            cropCtx.arc(nativeClickX, nativeClickY, 20, 0, 2 * Math.PI, false);
            cropCtx.fillStyle = 'rgba(239, 68, 68, 0.6)'; // Đỏ trong suốt
            cropCtx.fill();
            cropCtx.lineWidth = 5;
            cropCtx.strokeStyle = '#ef4444'; // Đỏ đậm
            cropCtx.stroke();

            // Vẽ tâm trắng ở giữa
            cropCtx.beginPath();
            cropCtx.arc(nativeClickX, nativeClickY, 6, 0, 2 * Math.PI, false);
            cropCtx.fillStyle = '#ffffff';
            cropCtx.fill();
        }
        
        // Trích xuất ảnh Full có chứa Hồng Tâm
        const fullBase64Image = cropCanvas.toDataURL('image/jpeg', 0.8);
        const apiBase64Image = fullBase64Image.split(',')[1];

        const newRecord: ScanRecord = {
            id: tempId,
            imageSrc: fullBase64Image,
            status: 'loading',
            words: []
        };
        setScanHistory(prev => [newRecord, ...prev]);

        try {
            const response = await apiClient.post('/user/student/vision/recognize', {
                imageBase64: apiBase64Image
            });

            const aiDataArray = response.data; 

            setScanHistory(prev => prev.map(record => {
                if (record.id === tempId) {
                    return {
                        ...record,
                        status: 'success',
                        words: Array.isArray(aiDataArray) ? aiDataArray : []
                    };
                }
                return record;
            }));

        } catch (error) {
            setScanHistory(prev => prev.map(record => {
                if (record.id === tempId) {
                    return {
                        ...record,
                        status: 'error',
                        words: [{ english: "Lỗi Server", vietnamese: "Không thể kết nối API", phonetic: "...", type: "Error", level: "❌" }]
                    };
                }
                return record;
            }));
        }
    };

    const removeRecord = (id: string) => {
        setScanHistory(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
            <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
                📷 Live Scanner - Mắt Đại Bàng
            </h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px', fontSize: '15px' }}>
                Click vào BẤT CỨ VỊ TRÍ NÀO trên camera. AI sẽ khoanh vùng ảnh đó và phân tích chi tiết!
            </p>

            {!isModelLoaded && (
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '12px', color: '#3b82f6', fontWeight: 'bold', marginBottom: '20px' }}>
                    ⏳ Đang nạp hệ thống thần kinh nhân tạo...
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button 
                    onClick={isCameraOpen ? stopCamera : startCamera} 
                    disabled={!isModelLoaded}
                    style={{ padding: '12px 30px', backgroundColor: isCameraOpen ? '#ef4444' : '#3b82f6', color: '#fff', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: isModelLoaded ? 'pointer' : 'not-allowed', fontSize: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: '0.2s' }}
                >
                    {isCameraOpen ? '🛑 Tắt Camera' : '▶ Bật Camera quét Live'}
                </button>
            </div>

            <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#1e293b', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)', border: '4px solid #f1f5f9' }}>
                <video 
                    ref={videoRef} autoPlay playsInline muted
                    onLoadedData={() => detectFrame()}
                    style={{ width: '100%', maxHeight: '55vh', objectFit: 'cover', display: isCameraOpen ? 'block' : 'none' }}
                />
                
                <canvas 
                    ref={canvasRef} 
                    onClick={handleCanvasClick}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair', display: isCameraOpen ? 'block' : 'none' }} 
                />

                {!isCameraOpen && (
                    <div style={{ padding: '120px 0', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold', fontSize: '18px' }}>
                        Camera đang tắt
                    </div>
                )}
            </div>

            {/* ========================================= */}
            {/* SỔ TAY ĐƯỢC THIẾT KẾ LẠI (ẢNH + TỪ VỰNG)  */}
            {/* ========================================= */}
            <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: '800' }}>
                        🛒 Lịch sử phân tích ({scanHistory.length})
                    </h3>
                    {scanHistory.length > 0 && (
                        <span onClick={() => setScanHistory([])} style={{ color: '#ef4444', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Xóa tất cả</span>
                    )}
                </div>

                {scanHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '12px', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
                        Mở camera và click vào một vật để xem sự diệu kỳ!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {scanHistory.map(record => (
                            <div key={record.id} style={{ display: 'flex', gap: '20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative' }}>
                                
                                {/* CỘT 1: HIỂN THỊ ẢNH ĐÃ CẮT */}
                                <div style={{ flexShrink: 0, width: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <img 
                                        src={record.imageSrc} 
                                        alt="Cropped object" 
                                        style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '3px solid #f1f5f9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                                    />
                                    {record.status === 'loading' && (
                                        <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>⏳ Đang soi...</span>
                                    )}
                                </div>

                                {/* CỘT 2: KẾT QUẢ TỪ VỰNG */}
                                <div style={{ flexGrow: 1 }}>
                                    {record.status === 'loading' && (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '15px' }}>
                                            AI đang phân tích bức ảnh này để trích xuất từ vựng...
                                        </div>
                                    )}

                                    {record.status !== 'loading' && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                            {record.words.map((word, idx) => (
                                                <div key={idx} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', minWidth: '200px', flex: '1 1 auto' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', textTransform: 'capitalize' }}>
                                                            {word.english}
                                                        </div>
                                                        {word.level && (
                                                            <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px', backgroundColor: ['A1','A2'].includes(word.level) ? '#dcfce3' : ['B1','B2'].includes(word.level) ? '#fef08a' : '#fecaca', color: ['A1','A2'].includes(word.level) ? '#166534' : ['B1','B2'].includes(word.level) ? '#854d0e' : '#991b1b' }}>
                                                                {word.level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 8px 0' }}>
                                                        {word.type} • {word.phonetic}
                                                    </div>
                                                    <div style={{ fontSize: '15px', color: '#334155', fontWeight: '600' }}>
                                                        Nghĩa: <span style={{ color: '#059669' }}>{word.vietnamese}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Nút xóa thẻ phân tích */}
                                <button onClick={() => removeRecord(record.id)} style={{ position: 'absolute', top: '15px', right: '15px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}