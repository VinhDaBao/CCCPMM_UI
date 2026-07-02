import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { io } from 'socket.io-client';
import Sidebar from './Sidebar';

const CreatorLayout = () => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => localStorage.getItem('active_workspace_id') || '');
  const queryClient = useQueryClient();
  const auth = useSelector(state => state.auth);
  const user = auth?.user || {};
  const userId = user._id || user.id;

  useEffect(() => {
    if (!userId) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080');

    socket.on('connect', () => {
      console.log('[Socket] Connected to server, registering user:', userId);
      socket.emit('register-user', userId);
    });

    socket.on('new-notification', (noti) => {
      console.log('[Socket] Received new notification:', noti);

      // Invalidate notifications query to trigger live UI updates (e.g. badge count)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Display a toast alert
      notification.info({
        message: noti.title,
        description: noti.message,
        placement: 'topRight',
        duration: 4.5
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, queryClient]);

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