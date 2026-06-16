import React from 'react';
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';
import { Provider } from "react-redux";
import { store } from "./redux/store";  
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import Pages
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import LoginPage from './pages/login.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

import CreatorLayout from './components/creator-layout/CreatorLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import AssetLibraryPage from './pages/AssetLibraryPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import './i18n';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      { index: true, element: <Navigate to="/workspace/dashboard" replace /> },
      
      { path: "register", element: <RegisterPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "verify-otp", element: <VerifyOtpPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },

      // NHÓM GIAO DIỆN CÓ SIDEBAR (CREATOR LAYOUT)
      {
        element: <ProtectedRoute><CreatorLayout /></ProtectedRoute>,
        children: [
          // Nhánh Workspace
          { path: "workspace/dashboard", element: <DashboardPage /> },
          { path: "workspace/editor", element: <WorkspacePage /> },
          { path: "workspace/assets", element: <AssetLibraryPage /> },
          { path: "workspace/settings", element: <SettingsPage /> },
          
          // Giữ nguyên 2 link Profile độc lập của bạn tại đây
          { path: "user/profile", element: <ProfilePage /> },
          { path: "admin/profile", element: <ProfilePage /> },
          { path: "user", element: <AdminRoute><UserPage /></AdminRoute> } 
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)