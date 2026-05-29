import React from 'react';
import { Button, Form, Input, notification } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { registerStart, registerSuccess, registerFail } from "../redux/authSlice";

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const registerLoading = useSelector(
        state => state.auth.registerLoading
    );

    const onFinish = async (values) => {
        const { name, email, password } = values;
        dispatch(registerStart());

        const res = await createUserApi(name, email, password);

        if (res && res.email) {
            dispatch(registerSuccess());

            notification.success({
                message: "REGISTRATION SUCCESSFUL",
                description: res.message || "Please check your email to receive the OTP code."
            });
            
            navigate("/verify-otp", { state: { email: email, type: "register" } });

        } else {
            dispatch(registerFail("Failed to create user"));
            
            const errorMsg = res?.errors ? res.errors[0].msg : res?.message || "Registration failed, please try again!";
            
            notification.error({
                message: "REGISTRATION FAILED",
                description: errorMsg
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/40">
                
                {/* Chỉ giữ lại chữ Register */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Register</h1>
                </div>
                
                <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                    
                    <Form.Item 
                        label="Full Name" 
                        name="name" 
                        rules={[
                            { required: true, message: "Please input your full name!" }
                        ]}
                    >
                        <Input size="large" prefix={<UserOutlined className="text-gray-400" />} placeholder="Enter full name" className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item 
                        label="Email" 
                        name="email" 
                        rules={[
                            { required: true, message: "Please input your email!" },
                            { type: "email", message: "Invalid email format!" }
                        ]}
                    >
                        <Input size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder="Enter email" className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item 
                        label="Password" 
                        name="password" 
                        rules={[
                            { required: true, message: "Please input your password!" },
                            { min: 6, message: "Password must be at least 6 characters!" }
                        ]}
                    >
                        <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="Enter password" className="!rounded-xl !py-2.5" />
                    </Form.Item>

                    <Form.Item className="mt-8 mb-0">
                        <Button 
                            loading={registerLoading} 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            size="large" 
                            className="!h-12 !rounded-xl !font-semibold !text-lg !bg-gradient-to-r !from-orange-500 !to-amber-600 !border-none hover:!opacity-95"
                        >
                            Create Account
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6 text-gray-500">
                    <div className="mb-4 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">Login</Link>
                    </div>
                    <Link to="/" className="inline-flex items-center gap-2 text-sm hover:text-orange-600 transition-colors">
                        <ArrowLeftOutlined /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;