import React, { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
    useDispatch,
    useSelector
} from "react-redux";
import {
    registerStart,
    registerSuccess,
    registerFail
} from "../redux/authSlice";
const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const registerLoading = useSelector(
        state => state.auth.registerLoading
    );
=======
import { ArrowLeftOutlined, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

>>>>>>> 46e75d21f45e5f272338458849bcf7e1b5f87b74
    const onFinish = async (values) => {
        const { name, email, password } = values;
        dispatch(registerStart());

        setIsLoading(true);

<<<<<<< HEAD
        if (res) {
                  dispatch(registerSuccess());

            notification.success({
                message: "CREATE USER",
                description: "Success"
            });
            
            navigate("/login");

        } else {
            dispatch(registerFail("Failed to create user"));
=======
        try {
            const res = await createUserApi(name, email, password);

            if (res && res.email) {
                notification.success({
                    message: t('auth_register.success_title'),
                    description: res.message || t('auth_register.success_desc_default')
                });

                navigate("/verify-otp", {
                    state: {
                        email: email,
                        type: "register"
                    }
                });
            } else {
                const errorMsg =
                    res?.errors
                        ? res.errors[0].msg
                        : res?.message || t('auth_register.failed_default');

                notification.error({
                    message: t('auth_register.failed_title'),
                    description: errorMsg
                });
            }
        } catch (error) {
>>>>>>> 46e75d21f45e5f272338458849bcf7e1b5f87b74
            notification.error({
                message: t('auth_register.system_error_title'),
                description: t('auth_register.system_error_desc')
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
<<<<<<< HEAD
        <Row justify={"center"} style={{ marginTop: "30px" }}>
            <Col xs={24} md={16} lg={8}>
                <fieldset style={{
                    padding: "15px",
                    margin: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px"
                }}>
                    <legend>Đang Ký Tai Khoan</legend>
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout='vertical'
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your email!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!',
                                },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your name!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button   loading={registerLoading} type="primary" htmlType="submit">
                                Submit </Button>
                        </Form.Item>
                    </Form>
                    <Link to={"/"}><ArrowLeftOutlined /> Back to Home Page</Link>
                    <Divider />
                    <div style={{ textAlign: "center" }}>
                        Already have an account? <Link to={"/login"}>Login here</Link>
                    </div>
                </fieldset>
            </Col>
        </Row >
    )
}
export default RegisterPage;
=======
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
            <div className="w-full max-w-md backdrop-blur-lg shadow-2xl rounded-3xl p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                
                {/* Chỉ giữ lại chữ Register */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">{t('auth_register.page_title')}</h1>
                </div>
                
                <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                    
                    <Form.Item 
                        label={t('auth_register.full_name_label')} 
                        name="name" 
                        rules={[
                            { required: true, message: t('auth_register.full_name_required') }
                        ]}
                    >
                        <Input size="large" prefix={<UserOutlined className="text-gray-400" />} placeholder={t('auth_register.full_name_placeholder')} className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item 
                        label={t('auth_register.email_label')} 
                        name="email" 
                        rules={[
                            { required: true, message: t('auth_register.email_required') },
                            { type: "email", message: t('auth_register.email_invalid') }
                        ]}
                    >
                        <Input size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder={t('auth_register.email_placeholder')} className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item 
                        label={t('auth_register.password_label')} 
                        name="password" 
                        rules={[
                            { required: true, message: t('auth_register.password_required') },
                            { min: 6, message: t('auth_register.password_min') }
                        ]}
                    >
                        <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder={t('auth_register.password_placeholder')} className="!rounded-xl !py-2.5" />
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
                            {t('auth_register.create_account_button')}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500">
                    <div className="mb-4 text-sm">
                        {t('auth_register.already_have_account')} {" "}
                        <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">{t('auth_register.login')}</Link>
                    </div>
                    <Link to="/" className="inline-flex items-center gap-2 text-sm hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> {t('auth_register.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
>>>>>>> 46e75d21f45e5f272338458849bcf7e1b5f87b74
