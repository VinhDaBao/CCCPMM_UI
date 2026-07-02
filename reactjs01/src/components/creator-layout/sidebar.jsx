import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import Icon from './Icons';
import { Modal } from 'antd';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { logoutApi } from '../../util/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Sidebar = ({ activeWorkspaceId, setActiveWorkspaceId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Extract user details from Redux
  const auth = useSelector(state => state.auth);
  const user = auth?.user || {};

  // Menu navigation list
  // Read the active workspace id from localStorage
  const localActiveWorkspaceId = activeWorkspaceId || localStorage.getItem('active_workspace_id') || "6a2e999a3c0cbd9d2589efb4";

  // Default menu items
  const navItems = [
    { id: "dashboard", path: "/workspace/dashboard", label: "Dashboard", icon: "kanban" },
    { id: "project", path: "/workspace/projects", label: "Project", icon: "grid" },
    // Sử dụng dấu nháy ngược (Backticks) để truyền biến động
    { id: "world", path: `/workspace/world/${localActiveWorkspaceId}`, label: "Relationship diagram", icon: "grid" },
    { id: "assets", path: "/workspace/assets", label: "Assets", icon: "assets" },
    { id: "settings", path: "/workspace/settings", label: "Settings", icon: "settings" },
  ];

  // If admin, append user management views
  if (user.role === 'admin') {
    navItems.push({ id: "admin-analytics", path: "/admin/dashboard", label: "Revenue Chart", icon: "sparkles" });
    navItems.push({ id: "users", path: "/user", label: "User Management", icon: "user" });
  }

  const handleLogout = async () => {
      try {
          await logoutApi();
      } catch (error) {
          console.log(
                "Logout API failed, but the frontend will still force sign-out",
              error
          );
      } finally {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('active_workspace_id');

          dispatch(logout());

          navigate('/login');
      }
  };

  const showLogoutConfirm = () => {
    Modal.confirm({
      title: 'Confirm sign out',
      content: 'Are you sure you want to sign out of this account?',
      okText: 'Sign out',
      okButtonProps: { danger: true }, 
      cancelText: 'Cancel',
      centered: true,
      onOk: handleLogout, 
    });
  };

  // Avatar / Display name fallbacks
  const avatarUrl = user.avatar ? (user.avatar.startsWith("data:") ? user.avatar : `${BACKEND_URL}${user.avatar}`) : null;
  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  const displayName = user.fullName && user.fullName !== "undefined" ? user.fullName : (user.email ? user.email.split('@')[0] : "Creator");

  return (
    <aside style={{
      width: 220, minWidth: 220, background: "var(--bg-base)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: "linear-gradient(135deg, var(--accent-amber), var(--accent-rust))",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="sparkles" size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 25, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              CreatorSpace
            </div>
            <div style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
              STUDIO
            </div>
          </div>
        </div>
      </div>

      <WorkspaceSwitcher activeWorkspaceId={activeWorkspaceId} setActiveWorkspaceId={setActiveWorkspaceId} />

      {/* Nav Menu */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", padding: "8px 10px 6px", textTransform: "uppercase" }}>
          Menu
        </div>
        {navItems.map(item => {
          const active = location.pathname.includes(item.path);
          return (
            <Link key={item.id} to={item.path}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                background: active ? "var(--bg-active)" : "transparent",
                color: active ? "var(--accent-amber)" : "var(--text-secondary)",
                fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: active ? 700 : 400,
                transition: "all 0.15s ease", marginBottom: 2, textDecoration: "none"
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name={item.icon} size={15} color={active ? "var(--accent-amber)" : "var(--text-muted)"} />
              {item.label}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "var(--accent-amber)" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div style={{ padding: "0 10px 10px" }}>
        <button 
          onClick={showLogoutConfirm} 
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 7, border: "none", cursor: "pointer",
            background: "transparent", color: "var(--accent-rust)",
            fontSize: 13, fontFamily: "'Lato', sans-serif", textAlign: "left", transition: "all 0.15s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(176, 58, 34, 0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Icon name="x" size={15} color="var(--accent-rust)" />
          Sign out
        </button>
      </div>

      {/* User profile entry */}
      <div 
        onClick={() => navigate("/workspace/settings")}
        style={{
          padding: "14px 16px", borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "background 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-lit)" }} />
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #b03a22, #e8a642)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>{initial}</div>
        )}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.role === 'admin' ? 'ADMINISTRATOR' : user.email}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;