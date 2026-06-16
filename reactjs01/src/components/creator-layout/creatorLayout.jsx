 import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const CreatorLayout = () => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => localStorage.getItem('active_workspace_id') || '');

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      {/* Cột trái: Sidebar cố định */}
      <Sidebar activeWorkspaceId={activeWorkspaceId} setActiveWorkspaceId={setActiveWorkspaceId} />
      
      {/* Cột phải: Khu vực render nội dung các trang con (Kanban, Workspace...) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Outlet context={{ activeWorkspaceId, setActiveWorkspaceId }} />
      </div>
    </div>
  );
};

export default CreatorLayout;