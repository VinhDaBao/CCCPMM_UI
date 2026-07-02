import React, { useEffect } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { ArrowLeftOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../util/api';
import { useTranslation } from 'react-i18next';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const email =
        location?.state?.email ||
        sessionStorage.getItem("reset_email");

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const onFinish = async (values) => {
        const { password, confirmPassword } = values;

        if (password !== confirmPassword) {
            notification.error({
                message: t('auth_reset.reset_password'),
                description: t('auth_reset.password_not_match'),
            });
            return;
        }

        try {
            const res = await resetPasswordApi(
                email,
                password
            );

            notification.success({
                message: t('auth_reset.reset_password'),
                description: res.message,
            });

            sessionStorage.removeItem("reset_email");

            navigate("/login");
        } catch (error) {
            notification.error({
                message: t('auth_reset.reset_password_failed'),
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    t('auth_reset.system_error'),
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
            <div className="w-full max-w-md backdrop-blur-lg shadow-2xl rounded-3xl p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>

                {/* Logo & Tiêu đề */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-white shadow-lg mb-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{t('auth_reset.page_title')}</h1>
                    <p className="text-gray-500 mt-2 text-sm">{t('auth_reset.subtitle')}</p>
                </div>

                <Form layout="vertical" onFinish={onFinish} autoComplete="off">

                    <Form.Item
                        label={t('auth_reset.new_password_label')}
                        name="password"
                        rules={[
                            { required: true, message: t('auth_reset.new_password_required') },
                            { min: 6, message: t('auth_reset.password_min') }
                        ]}
                    >
                        <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder={t('auth_reset.new_password_placeholder')} className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item
                        label={t('auth_reset.confirm_password_label')}
                        name="confirmPassword"
                        rules={[
                            { required: true, message: t('auth_reset.confirm_password_required') }
                        ]}
                    >
                        <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder={t('auth_reset.confirm_password_placeholder')} className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item className="mt-8 mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            className="!h-12 !rounded-xl !font-semibold !text-lg !bg-gradient-to-r !from-orange-500 !to-amber-600 !border-none hover:!opacity-95"
                        >
                            {t('auth_reset.reset_password_button')}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500 text-sm">
                    <div className="mb-4">
                        {t('auth_reset.note')}
                    </div>
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> {t('auth_reset.back_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;