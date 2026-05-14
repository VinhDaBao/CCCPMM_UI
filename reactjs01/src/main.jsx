import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';
import { Provider } from "react-redux";


import { store } from "./redux/store";
import {
createBrowserRouter,
RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
// import { AuthWrapper } from './components/context/auth.context.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

const router = createBrowserRouter([
{
path: "/",
element: <App />,
children: [
{
index: true,
element: <HomePage />
},
{
path: "/register",
element: <RegisterPage />
},
{
path: "/login",
element: <LoginPage />
},
{
path: "/user",
element: <UserPage />
}
]
},
{
path: "/forgot-password",
element: <ForgotPasswordPage />
},
{
path: "/verify-otp",
element: <VerifyOtpPage />
},
{
path: "/reset-password",
element: <ResetPasswordPage />
},
{
    path: "/profile",
    element: <ProfilePage />
}
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
 <Provider store={store}>

      <RouterProvider router={router} />

    </Provider>
  </React.StrictMode>,
)