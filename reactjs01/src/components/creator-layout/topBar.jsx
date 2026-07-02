import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Popover, Badge, List, Button, Spin, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Icon from './Icons';
import useNotifications from '../../hooks/useNotifications';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const TopBar = ({ title, subtitle, onNewScript }) => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const setActiveWorkspaceId = outletCtx?.setActiveWorkspaceId || (() => {});

  const auth = useSelector(state => state.auth);
  const user = auth?.user || {};
  const { t, i18n } = useTranslation();

  // Load latest 5 notifications
  const { data: notiData, isLoading, markAllRead, updateRead } = useNotifications(1, 5);
  const notifications = notiData?.data || [];
  const unreadCount = notiData?.pagination?.unreadCount || 0;

  const avatarUrl = user.avatar ? (user.avatar.startsWith("data:") ? user.avatar : `${BACKEND_URL}${user.avatar}`) : null;
  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

  const handleGoToProfile = () => {
    navigate('/workspace/settings');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
  };

  const truncateMessage = (msg) => {
    if (!msg) return "";
    const words = msg.split(/\s+/);
    if (words.length <= 12) return msg;
    return words.slice(0, 12).join(" ") + "...";
  };

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

  const renderPopoverTitle = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 2px 0' }}>
      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{t('topbar.notifications')}</span>
      {unreadCount > 0 && (
        <Button 
          type="link" 
          size="small" 
          onClick={() => markAllRead()} 
          style={{ padding: 0, fontSize: 12, color: 'var(--accent-amber)', fontWeight: 600 }}
        >
          {t('topbar.mark_all_read')}
        </Button>
      )}
    </div>
  );

  const renderPopoverContent = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', width: 300 }}>
          <Spin size="small" />
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div style={{ width: 300 }}>
          <Empty description={t('topbar.no_notifications')} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '12px 0' }} />
        </div>
      );
    }

    return (
      <div style={{ width: 320 }}>
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <div 
              onClick={() => handleNotificationClick(item)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: item.isRead ? 'transparent' : 'rgba(196, 123, 8, 0.04)',
                borderBottom: '1px solid var(--border)',
                marginBottom: 2,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = item.isRead ? 'transparent' : 'rgba(196, 123, 8, 0.04)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ 
                  fontWeight: item.isRead ? 500 : 700, 
                  color: 'var(--text-primary)', 
                  fontSize: 13,
                  lineHeight: '1.4'
                }}>
                  {item.title}
                </span>
                {!item.isRead && (
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-amber)',
                    display: 'inline-block',
                    flexShrink: 0,
                    marginTop: 6
                  }} />
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: '1.4' }}>
                {truncateMessage(item.message)}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 6 }}>
                {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
              </div>
            </div>
          )}
        />
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Button 
            type="link" 
            size="small" 
            onClick={() => navigate('/notifications')} 
            style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}
          >
            {t('topbar.see_all_notifications')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      height: 60, display: "flex", alignItems: "center",
      padding: "0 24px", borderBottom: "1px solid var(--border)",
      background: "var(--bg-base)", gap: 16,
      position: "sticky", top: 0, zIndex: 10,
    }}>
      {/* Title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "var(--text-primary)" }}>{title || t('topbar.workspace_fallback')}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{subtitle}</div>}
      </div>

      {/* Nút Tạo Kịch Bản */}
      {onNewScript && (
        <button onClick={onNewScript} style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "var(--accent-amber)", color: "#0d0d0f",
          border: "none", borderRadius: 8, padding: "7px 14px",
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Lato', sans-serif",
          transition: "opacity 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <Icon name="plus" size={14} color="#0d0d0f" />
          {t('topbar.new_script')}
        </button>
      )}

      {/* 4. NÚT ĐỔI NGÔN NGỮ EN/VI */}
      <button onClick={toggleLanguage} style={{
        background: "var(--bg-raised)", border: "1px solid var(--border)", 
        borderRadius: 8, padding: "6px 10px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
        fontFamily: "'Lato', sans-serif", color: "var(--text-secondary)"
      }}>
        {i18n.language === 'en' ? '🇺🇸 EN' : '🇻🇳 VI'}
      </button>

      {/* Popover Notification Bell */}
      <div style={{ marginLeft: 8 }}>
        <Popover
          content={renderPopoverContent()}
          title={renderPopoverTitle()}
          trigger="click"
          placement="bottomRight"
          arrow
        >
          <Badge count={unreadCount} overflowCount={99} size="small">
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-raised)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-secondary)'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-lit)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <BellOutlined style={{ fontSize: 16 }} />
            </div>
          </Badge>
        </Popover>
      </div>

      {/* Avatar */}
      <div onClick={handleGoToProfile} title={t('topbar.profile_title')} style={{ cursor: "pointer", marginLeft: 8 }}>
        {avatarUrl ? (
           <img src={avatarUrl} alt="avatar" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-lit)" }} />
        ) : (
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #b03a22, #e8a642)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
            border: "2px solid var(--border-lit)",
          }}>{initial}</div>
        )}
      </div>
    </div>
  );
};

export default TopBar;