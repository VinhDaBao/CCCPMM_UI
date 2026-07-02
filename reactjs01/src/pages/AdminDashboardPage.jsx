import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, notification } from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  CrownOutlined, 
  RiseOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import TopBar from '../components/creator-layout/TopBar';
import { useTranslation } from 'react-i18next';

// IMPORT API
import { getAdminDashboardStatsApi } from '../util/api'; 

// Keep 2 colors: Orange (FREE) and Blue (PRO)
const COLORS = ['#d97706', '#3b82f6'];

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    revenueData: [],
    planData: []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await getAdminDashboardStatsApi();
        
        if (res && res.errCode === 0) {
          setStats(res.data);
        } else {
          notification.error({ message: t('admin_dashboard.load_stats_failed'), description: res?.message });
        }
      } catch (error) {
        notification.error({ message: t('admin_dashboard.system_error'), description: t('admin_dashboard.system_error_desc') });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [t]);

  // Format currency VND
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      <TopBar title={t('admin_dashboard.title')} subtitle={t('admin_dashboard.subtitle')} />

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        
        {/* Overview Statistic Cards */}
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <Statistic 
                title={<span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t('admin_dashboard.total_users')}</span>} 
                value={stats.totalUsers} 
                prefix={<UserOutlined style={{ color: '#3b82f6', marginRight: 8 }} />} 
                valueStyle={{ color: 'var(--text-primary)', fontFamily: "'Instrument Serif', serif", fontSize: 38, marginTop: 4 }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <Statistic 
                title={<span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t('admin_dashboard.pro_subscriptions')}</span>} 
                value={stats.activeSubscriptions} 
                prefix={<CrownOutlined style={{ color: '#10b981', marginRight: 8 }} />} 
                valueStyle={{ color: 'var(--text-primary)', fontFamily: "'Instrument Serif', serif", fontSize: 38, marginTop: 4 }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <Statistic 
                title={<span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t('admin_dashboard.total_revenue')}</span>} 
                value={stats.totalRevenue} 
                formatter={(value) => formatVND(value)}
                prefix={<DollarOutlined style={{ color: 'var(--accent-amber)', marginRight: 8 }} />} 
                valueStyle={{ color: 'var(--accent-amber)', fontFamily: "'Instrument Serif', serif", fontSize: 38, marginTop: 4 }} 
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[20, 20]}>
          {/* Bar Chart: Revenue by month */}
          <Col xs={24} lg={16}>
            <Card 
              title={<span style={{ color: 'var(--text-primary)', fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 700 }}><RiseOutlined style={{ marginRight: 8 }}/> {t('admin_dashboard.revenue_last_6_months')}</span>} 
              style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12, height: '100%', boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
            >
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} style={{ fontFamily: "'Lato', sans-serif", fontSize: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-muted)" axisLine={false} tickLine={false} dy={10} />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => value > 0 ? `${value / 1000}k` : '0'} 
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: "'Lato', sans-serif", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(value) => [formatVND(value), t('admin_dashboard.revenue')]}
                      cursor={{ fill: 'var(--bg-hover)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    <Bar dataKey="revenue" name={t('admin_dashboard.revenue_vnd')} fill="var(--accent-amber)" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Pie Chart: Plan distribution */}
          <Col xs={24} lg={8}>
            <Card 
              title={<span style={{ color: 'var(--text-primary)', fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 700 }}><PieChartOutlined style={{ marginRight: 8 }}/> {t('admin_dashboard.plan_distribution')}</span>} 
              style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', borderRadius: 12, height: '100%', boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
            >
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <PieChart style={{ fontFamily: "'Lato', sans-serif", fontSize: 13 }}>
                    <Pie
                      data={stats.planData}
                      cx="50%"
                      cy="45%"
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
                      contentStyle={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)', borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      formatter={(value) => [`${value} ${t('admin_dashboard.users_suffix')}${value > 1 && t('admin_dashboard.users_suffix') === 'User' ? 's' : ''}`, t('admin_dashboard.amount')]}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: 'var(--text-primary)', fontSize: 12 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminDashboardPage;