import React from 'react';
import { Button, Form, Input, notification } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        const { email, password } = values;

        try {
            const res = await loginApi(email, password);
            console.log("LOGIN RESPONSE:", res);

            if (res && res.accessToken) {
                // 1. Lưu token
                localStorage.setItem("access_token", res.accessToken);
                localStorage.setItem("refresh_token", res.refreshToken);

                notification.success({
                    message: "Success",
                    description: "Login successful!"
                });

                dispatch(loginSuccess(res.user));

                // 2. Team logic: handle the workspace invitation link
                const inviteToken = localStorage.getItem("pendingInviteToken");
                if (inviteToken) {
                    localStorage.removeItem("pendingInviteToken");
                    navigate(`/invite/${inviteToken}`);
                    return; // Stop after navigation
                }

                // 3. Normal flow: route by role or open the editor
                if (res.user && res.user.role === 'admin') {
                    navigate(res.redirectUrl || "/admin/profile");
                } else {
                    navigate("/workspace/dashboard");
                }
            } else {
                // Handle backend error payloads that still return HTTP 200
                notification.error({
                    message: "Login failed",
                    description: res?.message ?? "Incorrect email or password"
                });
            }
        } catch (error) {
            // Catch 400, 401, and 403 errors (locked account, invalid password, etc.)
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "An error occurred. Please try again.";

            notification.error({
                message: "Login failed",
                description: errorMessage
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/40">
                <div className="text-center mb-8">
                    {/* Logo Custom giống hình ảnh */}
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-white shadow-lg mb-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">CreatorSpace</h1>
                    <p className="text-gray-500">Sign in to your account</p>
                </div>

                <Form name="basic" onFinish={onFinish} autoComplete="off" layout='vertical'>
                    <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                        <Input size="large" prefix={<MailOutlined />} placeholder="Enter email" className="!rounded-xl !py-2" />
                    </Form.Item>

                    <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                        <Input.Password size="large" prefix={<LockOutlined />} placeholder="Enter password" className="!rounded-xl !py-2" />
                    </Form.Item>

                    <div className="flex justify-between text-sm mb-6">
                        <Link to="/forgot-password" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">Forgot Password?</Link>
                        <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">Create Account</Link>
                    </div>

                    <Form.Item>
                        {/* Nút bấm chuyển sang màu Cam/Nâu */}
                        <Button type="primary" htmlType="submit" block size="large" className="!h-12 !rounded-xl !font-semibold !text-lg !bg-gradient-to-r !from-orange-500 !to-amber-600 !border-none hover:!opacity-90">
                            Login
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500">
                    <Link to="/" className="inline-flex items-center gap-2 hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;