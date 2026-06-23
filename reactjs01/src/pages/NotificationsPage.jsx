import React, { useState } from 'react';
import { Card, List, Button, Pagination, Spin, Empty, Tag, Typography } from 'antd';
import { useNavigate, useOutletContext } from 'react-router-dom';
import dayjs from 'dayjs';
import TopBar from '../components/creator-layout/topBar';
import useNotifications from '../hooks/useNotifications';

const { Title, Text } = Typography;

const typeColorMap = {
  SYSTEM: 'red',
  WORKSPACE: 'blue',
  PROJECT: 'green',
  WORLD: 'purple',
  BILLING: 'orange'
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const setActiveWorkspaceId = outletCtx?.setActiveWorkspaceId || (() => { });

  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: notiData, isLoading, markAllRead, updateRead } = useNotifications(page, limit);
  const notifications = notiData?.data || [];
  const pagination = notiData?.pagination || { totalItems: 0 };
  const unreadCount = pagination.unreadCount || 0;

  const handleNotificationClick = async (noti) => {
    try {
      if (!noti.isRead) {
        await updateRead({ id: noti._id || noti.id, isRead: true });
      }
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }

    if (noti.workspaceId) {
      localStorage.setItem('active_workspace_id', noti.workspaceId);
      setActiveWorkspaceId(noti.workspaceId);
    }

    if (noti.navigate) {
      navigate(noti.navigate);
    }
  };

  const handlePageChange = (p) => {
    setPage(p);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      <TopBar title="Notifications" subtitle="View and manage your activities, system alerts, and workspace updates" />

      <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", background: 'var(--bg-surface)' }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>All Notifications</Title>
              <Text type="secondary" style={{ color: 'var(--text-muted)' }}>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Text>
            </div>

            {unreadCount > 0 && (
              <Button
                type="primary"
                onClick={() => markAllRead()}
                style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#fff', fontWeight: 600 }}
              >
                Mark All as Read
              </Button>
            )}
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : notifications.length === 0 ? (
            <Empty description="No notifications found" style={{ padding: '60px 0' }} />
          ) : (
            <div>
              <List
                itemLayout="vertical"
                dataSource={notifications}
                renderItem={(item) => (
                  <div
                    onClick={() => handleNotificationClick(item)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      background: item.isRead ? 'transparent' : 'rgba(196, 123, 8, 0.03)',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: 8,
                      position: 'relative',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = item.isRead ? 'transparent' : 'rgba(196, 123, 8, 0.03)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color={typeColorMap[item.type] || 'blue'}>{item.type}</Tag>
                        <span style={{
                          fontWeight: item.isRead ? 600 : 800,
                          color: 'var(--text-primary)',
                          fontSize: 15
                        }}>
                          {item.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </span>
                        {!item.isRead && (
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--accent-amber)',
                            display: 'inline-block'
                          }} />
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: '1.6' }}>
                      {item.message}
                    </div>
                  </div>
                )}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <Pagination
                  current={page}
                  pageSize={limit}
                  total={pagination.totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
