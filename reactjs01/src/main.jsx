import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';
import { Provider } from "react-redux";
import { store } from "./redux/store";  
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

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
// Component Bảo vệ Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

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
          { path: "user", element: <UserPage /> } // Nếu trang này cũng cần Sidebar
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)