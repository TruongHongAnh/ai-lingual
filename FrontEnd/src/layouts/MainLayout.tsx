import { Outlet } from 'react-router-dom';
import Header from '../components/UserHeader';
import { getUserRole } from '../utils/auth';

export default function MainLayout() {
    // Lấy role từ local storage (mặc định là User nếu chưa đăng nhập)
    const role = getUserRole() || 'User';
    
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: role === 'User' ? '#fff' : '#f8fafc' }}>
            
            {/* Thanh điều hướng dùng chung, truyền role vào để tự biến hình */}
            <Header role={role} />

            {/* Vùng nội dung chính (Outlet). Admin/CM nền xám nhạt cho ra dáng Dashboard, User nền trắng */}
            <main style={{ flex: 1, padding: role === 'User' ? '50px 20px' : '30px 40px', display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </main>

            {/* FOOTER: Chỉ hiển thị cho Học viên. Admin/CM cần giao diện rộng rãi nên sẽ ẩn đi */}
            {role === 'User' && (
                <footer style={{ backgroundColor: '#faf9f5', borderTop: '1px solid #e2e8f0', padding: '50px 40px', marginTop: 'auto' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                        <div>
                            <h4 style={{ color: '#0f172a', fontSize: '16px', marginBottom: '20px' }}>Công cụ AI</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Sửa lỗi Ngữ pháp</span>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Hội thoại Role-play</span>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Nghe chép chính tả</span>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Dịch thuật tự nhiên</span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color: '#0f172a', fontSize: '16px', marginBottom: '20px' }}>Ngôn ngữ</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>🇺🇸 Tiếng Anh (IELTS/TOEIC)</span>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>🇯🇵 Tiếng Nhật (JLPT)</span>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>🇨🇳 Tiếng Trung (HSK)</span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color: '#0f172a', fontSize: '16px', marginBottom: '20px' }}>Cộng đồng</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Gửi góp ý</span>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Facebook</span>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>YouTube</span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color: '#0f172a', fontSize: '16px', marginBottom: '20px' }}>Pháp lý</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Điều khoản sử dụng</span>
                                <span style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Chính sách bảo mật</span>
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            {/* NÚT GÓP Ý: Cũng chỉ nên hiện cho Học viên */}
            {role === 'User' && (
                <button style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 999 }}>
                    💬 Góp ý
                </button>
            )}
        </div>
    );
}