import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
// IMPORT THƯ VIỆN BIỂU ĐỒ CHỨNG KHOÁN
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, premiumUsers: 0, totalRevenue: 0, pendingTickets: 0 });
    const [loading, setLoading] = useState(true);

    // STATE CHO TỪNG BIỂU ĐỒ RIÊNG BIỆT
    const [revRange, setRevRange] = useState('7d');
    const [revenueData, setRevenueData] = useState<{ day: string, total: number }[]>([]);
    
    const [growthRange, setGrowthRange] = useState('7d');
    const [userGrowthData, setUserGrowthData] = useState<{ day: string, count: number }[]>([]);

    useEffect(() => {
        apiClient.get('/admin/dashboard-stats').then(res => { setStats(res.data); setLoading(false); }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        apiClient.get(`/admin/revenue-chart?range=${revRange}`).then(res => setRevenueData(res.data)).catch(e => console.error(e));
    }, [revRange]);

    useEffect(() => {
        apiClient.get(`/admin/user-growth-chart?range=${growthRange}`).then(res => setUserGrowthData(res.data)).catch(e => console.error(e));
    }, [growthRange]);

    // Tính Tổng/Trung bình
    const totalRevPeriod = revenueData.reduce((sum, item) => sum + item.total, 0);
    const avgRevPeriod = revenueData.length > 0 ? totalRevPeriod / revenueData.length : 0;

    const totalGrowthPeriod = userGrowthData.reduce((sum, item) => sum + item.count, 0);
    const avgGrowthPeriod = userGrowthData.length > 0 ? totalGrowthPeriod / userGrowthData.length : 0;

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: 'bold', color: '#64748b' }}>⏳ Đang tải Số liệu Tổng quan...</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
            
            <style>{`
                .stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 20px; transition: 0.2s; }
                .stat-card:hover { box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08); transform: translateY(-2px); }
                .icon-box { width: 60px; height: 60px; border-radius: 16px; display: flex; justify-content: center; align-items: center; font-size: 28px; flex-shrink: 0; }
                
                .filter-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 8px; gap: 4px; }
                .filter-tab { padding: 6px 12px; border-radius: 6px; border: none; font-weight: 800; font-size: 12px; cursor: pointer; transition: 0.2s; background: transparent; color: #64748b; }
                .filter-tab.active { background: #fff; color: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

                .chart-container { background: #fff; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                <span style={{ fontSize: '36px' }}>📊</span>
                <div>
                    <h1 style={{ color: '#0f172a', margin: 0, fontSize: '30px', fontWeight: '900', letterSpacing: '-0.5px' }}>Tổng quan Hệ thống</h1>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '16px' }}>Theo dõi sức khỏe tài chính và lượng người dùng.</p>
                </div>
            </div>

            {/* CÁC THẺ WIDGETS TỔNG QUAN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
                <div className="stat-card">
                    <div className="icon-box" style={{ background: '#e0e7ff', color: '#4f46e5' }}>👥</div>
                    <div>
                        <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>Tổng Học viên</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{stats.totalUsers}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon-box" style={{ background: '#fae8ff', color: '#9333ea' }}>💎</div>
                    <div>
                        <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>Tài khoản VIP</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{stats.premiumUsers}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #dcfce3 0%, #bbf7d0 100%)', borderColor: '#86efac' }}>
                    <div className="icon-box" style={{ background: '#fff', color: '#166534' }}>💰</div>
                    <div>
                        <div style={{ color: '#166534', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>Doanh thu (VNĐ)</div>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: '#14532d' }}>{stats.totalRevenue.toLocaleString()} đ</div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderColor: stats.pendingTickets > 0 ? '#fca5a5' : '#e2e8f0', background: stats.pendingTickets > 0 ? '#fef2f2' : '#fff' }}>
                    <div className="icon-box" style={{ background: '#fee2e2', color: '#ef4444' }}>🛠️</div>
                    <div>
                        <div style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>Ticket chờ xử lý</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#ef4444' }}>{stats.pendingTickets}</div>
                    </div>
                </div>
            </div>

            {/* KHU VỰC BIỂU ĐỒ BẰNG RECHARTS (CHUẨN CHỨNG KHOÁN) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* ==================================================== */}
                {/* BIỂU ĐỒ 1: DOANH THU                                 */}
                {/* ==================================================== */}
                <div className="chart-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a', fontWeight: '900' }}>📈 Biểu đồ Doanh thu</h3>
                            <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>
                                Tổng: {totalRevPeriod.toLocaleString()} đ <span style={{color: '#94a3b8'}}>| TB: {Math.round(avgRevPeriod).toLocaleString()} đ/cột</span>
                            </div>
                        </div>
                        <div className="filter-tabs">
                            <button className={`filter-tab ${revRange === '7d' ? 'active' : ''}`} onClick={() => setRevRange('7d')}>7 Ngày</button>
                            <button className={`filter-tab ${revRange === '30d' ? 'active' : ''}`} onClick={() => setRevRange('30d')}>30 Ngày</button>
                            <button className={`filter-tab ${revRange === '1y' ? 'active' : ''}`} onClick={() => setRevRange('1y')}>Năm nay</button>
                        </div>
                    </div>
                    
                    <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={revenueData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                <defs>
                                    {/* Khai báo màu mờ dần cho vùng bên dưới đường Line */}
                                    <linearGradient id="colorRevArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                    {/* Khai báo màu gradient cho Cột */}
                                    <linearGradient id="colorRevBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#60a5fa"/>
                                        <stop offset="100%" stopColor="#3b82f6"/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                                
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9' }} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold', color: '#0f172a' }}
                                    formatter={(value: any) => [`${Number(value).toLocaleString()} VNĐ`, 'Doanh thu']}
                                    labelStyle={{ color: '#64748b', marginBottom: '5px' }}
                                />
                                
                                {/* Bar là cột, Area là đường xu hướng kèm đổ bóng */}
                                <Bar dataKey="total" barSize={revRange === '30d' ? 12 : 35} fill="url(#colorRevBar)" radius={[4, 4, 0, 0]} />
                                <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRevArea)" activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* BIỂU ĐỒ 2: LƯỢNG TRUY CẬP USER CÓ ĐƯỜNG PHÁT TRIỂN   */}
                {/* ==================================================== */}
                <div className="chart-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a', fontWeight: '900' }}>🚀 Lượng truy cập User</h3>
                            <div style={{ color: '#7c3aed', fontSize: '14px', fontWeight: 'bold' }}>
                                Tổng truy cập: {totalGrowthPeriod.toLocaleString()} <span style={{color: '#94a3b8'}}>| TB: {Math.round(avgGrowthPeriod)} users/cột</span>
                            </div>
                        </div>
                        <div className="filter-tabs">
                            <button className={`filter-tab ${growthRange === '7d' ? 'active' : ''}`} onClick={() => setGrowthRange('7d')}>7 Ngày</button>
                            <button className={`filter-tab ${growthRange === '30d' ? 'active' : ''}`} onClick={() => setGrowthRange('30d')}>30 Ngày</button>
                            <button className={`filter-tab ${growthRange === '1y' ? 'active' : ''}`} onClick={() => setGrowthRange('1y')}>Năm nay</button>
                        </div>
                    </div>
                    
                    <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={userGrowthData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="colorGrowthArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorGrowthBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#34d399"/>
                                        <stop offset="100%" stopColor="#10b981"/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} allowDecimals={false} />
                                
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9' }} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold', color: '#0f172a' }}
                                    formatter={(value: any) => [`${value} Users`, 'Truy cập']}
                                    labelStyle={{ color: '#64748b', marginBottom: '5px' }}
                                />
                                
                                <Bar dataKey="count" barSize={growthRange === '30d' ? 12 : 35} fill="url(#colorGrowthBar)" radius={[4, 4, 0, 0]} />
                                <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowthArea)" activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}