import React from 'react';
import { Button, Form, Input, notification } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();

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
                    message: t('auth_login.success'),
                    description: t('auth_login.login_success')
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
                    message: t('auth_login.login_failed'),
                    description: res?.message ?? t('auth_login.login_failed_default')
                });
            }
        } catch (error) {
            // Catch 400, 401, and 403 errors (locked account, invalid password, etc.)
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                t('auth_login.login_error_default');

            notification.error({
                message: t('auth_login.login_failed'),
                description: errorMessage
            });
        }
    };

    return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
                <div className="w-full max-w-md backdrop-blur-lg shadow-2xl rounded-3xl p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <div className="text-center mb-8">
                    {/* Logo Custom giống hình ảnh */}
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-white shadow-lg mb-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>CreatorSpace</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('auth_login.sign_in_subtitle')}</p>
                </div>

                <Form name="basic" onFinish={onFinish} autoComplete="off" layout='vertical'>
                    <Form.Item label={t('auth_login.email_label')} name="email" rules={[{ required: true, message: t('auth_login.email_required') }]}>
                        <Input size="large" prefix={<MailOutlined />} placeholder={t('auth_login.email_placeholder')} className="!rounded-xl !py-2" />
                    </Form.Item>

                    <Form.Item label={t('auth_login.password_label')} name="password" rules={[{ required: true, message: t('auth_login.password_required') }]}>
                        <Input.Password size="large" prefix={<LockOutlined />} placeholder={t('auth_login.password_placeholder')} className="!rounded-xl !py-2" />
                    </Form.Item>

                    <div className="flex justify-between text-sm mb-6">
                        <Link to="/forgot-password" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">{t('auth_login.forgot_password')}</Link>
                        <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">{t('auth_login.create_account')}</Link>
                    </div>

                    <Form.Item>
                        {/* Nút bấm chuyển sang màu Cam/Nâu */}
                        <Button type="primary" htmlType="submit" block size="large" className="!h-12 !rounded-xl !font-semibold !text-lg !bg-gradient-to-r !from-orange-500 !to-amber-600 !border-none hover:!opacity-90">
                            {t('auth_login.login_button')}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500">
                    <Link to="/" className="inline-flex items-center gap-2 hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> {t('auth_login.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;