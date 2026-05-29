import React from 'react';
import { Button, Form, Input, notification } from 'antd';
import { ArrowLeftOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../util/api';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Lấy email được truyền từ trang Xác thực OTP trước đó
    const email = location?.state?.email;

    const onFinish = async (values) => {
        const { password, confirmPassword } = values;

        if (password !== confirmPassword) {
            notification.error({
                message: "RESET PASSWORD",
                description: "Passwords do not match"
            });
            return;
        }

        console.log("RESET PASSWORD:", password);

        const res = await resetPasswordApi(email, password);

        if (res && res.errCode === 0) {
            notification.success({
                message: "RESET PASSWORD",
                description: res.message
            });
            navigate("/login");
        } else {
            notification.error({
                message: "RESET PASSWORD",
                description: res?.message ?? "Error"
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/40">
                
                {/* Logo & Tiêu đề */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-white shadow-lg mb-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Reset Password</h1>
                    <p className="text-gray-500 mt-2 text-sm">Enter your new password below</p>
                </div>

                <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                    
                    <Form.Item 
                        label="New Password" 
                        name="password" 
                        rules={[
                            { required: true, message: "Please input new password!" },
                            { min: 6, message: "Password must be at least 6 characters!" }
                        ]}
                    >
                        <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="Enter new password" className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item 
                        label="Confirm Password" 
                        name="confirmPassword" 
                        rules={[
                            { required: true, message: "Please confirm password!" }
                        ]}
                    >
                        <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="Confirm password" className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item className="mt-8 mb-0">
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            size="large" 
                            className="!h-12 !rounded-xl !font-semibold !text-lg !bg-gradient-to-r !from-orange-500 !to-amber-600 !border-none hover:!opacity-95"
                        >
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500 text-sm">
                    <div className="mb-4">
                        Your password will be updated immediately.
                    </div>
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;