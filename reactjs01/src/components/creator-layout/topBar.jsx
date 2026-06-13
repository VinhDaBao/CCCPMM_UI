import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import Hook dịch
import Icon from './Icons';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const TopBar = ({ title, subtitle, onNewScript }) => {
  const navigate = useNavigate();
  const auth = useSelector(state => state.auth);
  const user = auth?.user || {};
  
  // 2. Khởi tạo hàm dịch t() và i18n
  const { t, i18n } = useTranslation();

  const avatarUrl = user.avatar ? (user.avatar.startsWith("data:") ? user.avatar : `${BACKEND_URL}${user.avatar}`) : null;
  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

  const handleGoToProfile = () => {
    navigate('/users/profile');
  };

  // 3. Hàm chuyển đổi ngôn ngữ
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
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
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "var(--text-primary)" }}>{title || "Workspace"}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{subtitle}</div>}
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "6px 12px", width: 220,
      }}>
        <Icon name="search" size={14} color="var(--text-muted)" />
        {/* Dùng từ điển cho Placeholder */}
        <input placeholder={t('topbar.search')} style={{
          background: "none", border: "none", outline: "none",
          color: "var(--text-primary)", fontSize: 13, fontFamily: "'Lato', sans-serif", width: "100%",
        }} />
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
          {/* Dùng từ điển */}
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

      {/* Avatar */}
      <div onClick={handleGoToProfile} title="My Profile" style={{ cursor: "pointer", marginLeft: 8 }}>
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