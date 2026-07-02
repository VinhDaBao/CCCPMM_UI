import React, { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../util/api';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

  const onFinish = async (values) => {
    const { email } = values;

    setIsLoading(true);

    try {
      const res = await forgotPasswordApi(email);

      notification.success({
                message: t('auth_forgot.send_otp_title'),
        description: res.message,
      });

      navigate("/verify-otp", {
        state: { email },
      });

    } catch (error) {
      notification.error({
                message: t('auth_forgot.send_otp_failed_title'),
        description:
          error?.response?.data?.message ||
          error?.message ||
                    t('auth_forgot.system_error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

    return (
        <div className="min-h-screen flex items-center justify-center page-hero px-4">
            <div className="w-full max-w-md backdrop-blur-lg shadow-2xl rounded-3xl p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                
                {/* Logo & Tiêu đề */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-white shadow-lg mb-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{t('auth_forgot.page_title')}</h1>
                    <p className="text-gray-500 mt-2 text-sm">{t('auth_forgot.subtitle')}</p>
                </div>

                <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                    
                    <Form.Item 
                        label={t('auth_forgot.email_label')} 
                        name="email" 
                        rules={[
                            { required: true, message: t('auth_forgot.email_required') },
                            { type: "email", message: t('auth_forgot.email_invalid') }
                        ]}
                    >
                        <Input size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder={t('auth_forgot.email_placeholder')} className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item className="mt-8 mb-0">
                        <Button 
                            loading={isLoading}
                            type="primary" 
                            htmlType="submit" 
                            block 
                            size="large" 
                            className="!h-12 !rounded-xl !font-semibold !text-lg !bg-gradient-to-r !from-orange-500 !to-amber-600 !border-none hover:!opacity-95"
                        >
                            {t('auth_forgot.send_otp_button')}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500 text-sm">
                    <div className="mb-4">
                        {t('auth_forgot.note_after_send')}
                    </div>
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> {t('auth_forgot.back_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;