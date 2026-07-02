import React, { useEffect, useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { ArrowLeftOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyOtpApi, verifyRegisterOtpApi, forgotPasswordApi } from '../util/api';
import { useTranslation } from 'react-i18next';

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
const { t } = useTranslation();

useEffect(() => {
    if (!email) {
        notification.warning({
            message: t('auth_verify.session_expired_title'),
            description: t('auth_verify.session_expired_desc'),
        });

        navigate("/forgot-password");
    }
}, [email, navigate, t]);

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
                message: t('auth_verify.account_activated'),
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
                message: t('auth_verify.verification_success'),
                description:
                    res.message || "Success!",
            });

            navigate("/reset-password");
        }
    } catch (error) {
        notification.error({
            message:
                type === "register"
                    ? t('auth_verify.activation_failed')
                    : t('auth_verify.verification_failed'),

            description:
                error?.response?.data
                    ?.message ||
                error?.message ||
                t('auth_verify.system_error'),
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
            message: t('auth_verify.resend_otp_title'),
            description: res.message,
        });

        setCountdown(120);
    } catch (error) {
        notification.error({
            message: t('auth_verify.resend_otp_failed_title'),
            description:
                error?.response?.data
                    ?.message ||
                error?.message ||
                t('auth_verify.resend_otp_failed_default'),
        });
    } finally {
        setIsResending(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
            <div className="w-full max-w-md backdrop-blur-lg shadow-2xl rounded-3xl p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                
                {/* Logo & Tiêu đề linh hoạt */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-white shadow-lg mb-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        {type === "register" ? t('auth_verify.title_activate') : t('auth_verify.title_verify')}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        {t('auth_verify.subtitle')}
                    </p>
                </div>

                <Form layout='vertical' onFinish={onFinish} autoComplete="off">
                    <Form.Item 
                        label={t('auth_verify.otp_label')} 
                        name="otp" 
                        rules={[{ required: true, message: t('auth_verify.otp_required') }]}
                    >
                        <Input size="large" prefix={<SafetyOutlined className="text-gray-400" />} placeholder={t('auth_verify.otp_placeholder')} className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <div className={`mb-6 text-sm text-center font-medium ${countdown <= 10 ? "text-red-500" : "text-gray-500"}`}>
                        {t('auth_verify.expires_in')} {formatTime(countdown)}
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
                            {type === "register" ? t('auth_verify.activate_now') : t('auth_verify.verify_otp')}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500 text-sm">
                    <div className="mb-4">
                        {t('auth_verify.did_not_receive')} {" "}
                        <button 
                            disabled={countdown > 0 || isResending} 
                            onClick={handleResendOtp}
                            className={`font-medium transition-colors bg-transparent border-none p-0 ${(countdown > 0 || isResending) ? "text-gray-400 cursor-not-allowed" : "text-orange-600 hover:text-orange-700 cursor-pointer"}`}
                        >
                            {t('auth_verify.resend_otp')}
                        </button>
                    </div>
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> {t('auth_verify.back_login')}
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default VerifyOtpPage;