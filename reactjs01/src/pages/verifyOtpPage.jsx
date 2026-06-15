import React, { useEffect, useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { ArrowLeftOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyOtpApi, verifyRegisterOtpApi, forgotPasswordApi } from '../util/api';

const VerifyOtpPage = () => {
const navigate = useNavigate();
const location = useLocation();

const email =
    location?.state?.email ||
    sessionStorage.getItem("reset_email");

const type = location?.state?.type;

const [countdown, setCountdown] = useState(300);
const [isVerifying, setIsVerifying] = useState(false);
const [isResending, setIsResending] = useState(false);

useEffect(() => {
    if (!email) {
        notification.warning({
            message: "Session expired",
            description: "Please restart the process",
        });

        navigate("/forgot-password");
    }
}, [email, navigate]);

useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
}, [countdown]);

const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const onFinish = async (values) => {
    const { otp } = values;

    if (!email) return;

    setIsVerifying(true);

    try {
        if (type === "register") {
            const res =
                await verifyRegisterOtpApi(
                    email,
                    otp
                );

            notification.success({
                message: "ACCOUNT ACTIVATED",
                description:
                    res.message || "Success!",
            });

            navigate("/login");
        } else {
            const res =
                await verifyOtpApi(
                    email,
                    otp
                );

            sessionStorage.setItem(
                "reset_email",
                email
            );

            notification.success({
                message:
                    "VERIFICATION SUCCESSFUL",
                description:
                    res.message || "Success!",
            });

            navigate("/reset-password");
        }
    } catch (error) {
        notification.error({
            message:
                type === "register"
                    ? "ACTIVATION FAILED"
                    : "VERIFICATION FAILED",

            description:
                error?.response?.data
                    ?.message ||
                error?.message ||
                "System error",
        });
    } finally {
        setIsVerifying(false);
    }
};

const handleResendOtp = async () => {
    if (!email) return;

    setIsResending(true);

    try {
        const res =
            await forgotPasswordApi(email);

        notification.success({
            message: "RESEND OTP",
            description: res.message,
        });

        setCountdown(120);
    } catch (error) {
        notification.error({
            message: "RESEND OTP FAILED",
            description:
                error?.response?.data
                    ?.message ||
                error?.message ||
                "Error resending OTP",
        });
    } finally {
        setIsResending(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/40">
                
                {/* Logo & Tiêu đề linh hoạt */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-white shadow-lg mb-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        {type === "register" ? "Activate Account" : "Verify OTP"}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Enter the OTP code sent to your email
                    </p>
                </div>

                <Form layout='vertical' onFinish={onFinish} autoComplete="off">
                    <Form.Item 
                        label="OTP Code" 
                        name="otp" 
                        rules={[{ required: true, message: "Please input OTP!" }]}
                    >
                        <Input size="large" prefix={<SafetyOutlined className="text-gray-400" />} placeholder='Enter OTP' className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <div className={`mb-6 text-sm text-center font-medium ${countdown <= 10 ? "text-red-500" : "text-gray-500"}`}>
                        OTP expires in: {formatTime(countdown)}
                    </div>

                    <Form.Item className="mb-0">
                        <Button 
                            loading={isVerifying}
                            type='primary' 
                            htmlType='submit' 
                            block 
                            size="large" 
                            className="!h-12 !rounded-xl !font-semibold !text-lg !bg-gradient-to-r !from-orange-500 !to-amber-600 !border-none hover:!opacity-95"
                        >
                            {type === "register" ? "Activate Now" : "Verify OTP"}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500 text-sm">
                    <div className="mb-4">
                        Didn't receive OTP?{" "}
                        <button 
                            disabled={countdown > 0 || isResending} 
                            onClick={handleResendOtp}
                            className={`font-medium transition-colors bg-transparent border-none p-0 ${(countdown > 0 || isResending) ? "text-gray-400 cursor-not-allowed" : "text-orange-600 hover:text-orange-700 cursor-pointer"}`}
                        >
                            Resend OTP
                        </button>
                    </div>
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default VerifyOtpPage;