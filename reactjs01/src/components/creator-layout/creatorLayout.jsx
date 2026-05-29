 import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const CreatorLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-void)" }}>
      {/* Cột trái: Sidebar cố định */}
      <Sidebar />
      
      {/* Cột phải: Khu vực render nội dung các trang con (Kanban, Workspace...) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default CreatorLayout;