import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography } from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  CrownOutlined, 
  RiseOutlined 
} from '@ant-design/icons';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const { Title } = Typography;

// Màu sắc chủ đạo cho các biểu đồ (Đồng bộ với theme của app)
const COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6'];

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    revenueData: [],
    planData: []
  });

  // Giả lập gọi API lấy dữ liệu thống kê (Sau này thay bằng axios/fetch thật)
  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        activeSubscriptions: 450,
        totalRevenue: 125000000,
        revenueData: [
          { month: 'Tháng 1', revenue: 15000000 },
          { month: 'Tháng 2', revenue: 18000000 },
          { month: 'Tháng 3', revenue: 12000000 },
          { month: 'Tháng 4', revenue: 25000000 },
          { month: 'Tháng 5', revenue: 22000000 },
          { month: 'Tháng 6', revenue: 33000000 },
        ],
        planData: [
          { name: 'Gói FREE', value: 800 },
          { name: 'Gói PRO', value: 300 },
          { name: 'Gói ENTERPRISE', value: 150 },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  // Format tiền tệ VNĐ
  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-void)' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: 'var(--bg-void)', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: 'var(--text-primary)', margin: 0 }}>Quản trị hệ thống (Admin)</Title>
        <div style={{ color: 'var(--text-muted)' }}>Theo dõi doanh thu và tình trạng người dùng</div>
      </div>

      {/* Dãy Thẻ Thống Kê Tổng Quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12 }}>
            <Statistic 
              title={<span style={{ color: 'var(--text-secondary)' }}>Tổng người dùng</span>} 
              value={stats.totalUsers} 
              prefix={<UserOutlined style={{ color: '#3b82f6' }} />} 
              valueStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12 }}>
            <Statistic 
              title={<span style={{ color: 'var(--text-secondary)' }}>Đăng ký Premium (Active)</span>} 
              value={stats.activeSubscriptions} 
              prefix={<CrownOutlined style={{ color: '#10b981' }} />} 
              valueStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12 }}>
            <Statistic 
              title={<span style={{ color: 'var(--text-secondary)' }}>Tổng doanh thu</span>} 
              value={stats.totalRevenue} 
              formatter={(value) => formatVND(value)}
              prefix={<DollarOutlined style={{ color: '#d97706' }} />} 
              valueStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
      </Row>

      {/* Hàng Biểu Đồ */}
      <Row gutter={[16, 16]}>
        {/* Biểu Đồ Cột: Doanh thu theo tháng */}
        <Col xs={24} lg={16}>
          <Card 
            title={<span style={{ color: 'var(--text-primary)' }}><RiseOutlined /> Doanh thu 6 tháng gần nhất</span>} 
            style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12, height: '100%' }}
          >
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={stats.revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    tickFormatter={(value) => `${value / 1000000}tr`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                    formatter={(value) => [formatVND(value), 'Doanh thu']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Doanh thu (VNĐ)" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Biểu Đồ Tròn: Tỉ lệ các gói */}
        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ color: 'var(--text-primary)' }}><PieChart /> Tỉ lệ gói tài khoản</span>} 
            style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12, height: '100%' }}
          >
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)', borderRadius: 8 }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-primary)' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;