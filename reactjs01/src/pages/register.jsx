import React from 'react';
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
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

    const onFinish = async (values) => {
        const { name, email, password } = values;
        dispatch(registerStart());

        const res = await createUserApi(name, email, password);

        // Kiểm tra res.email vì Backend (authController) trả về { message: "...", email: newUser.email } khi thành công
        if (res && res.email) {
            dispatch(registerSuccess());

            notification.success({
                message: "ĐĂNG KÝ THÀNH CÔNG",
                description: res.message || "Vui lòng kiểm tra email để nhận mã OTP."
            });
            
            navigate("/verify-otp", { state: { email: email, type: "register" } });

        } else {
            dispatch(registerFail("Failed to create user"));
            
            // Xử lý thông báo lỗi từ Backend (Lỗi validation array hoặc lỗi string message)
            const errorMsg = res?.errors ? res.errors[0].msg : res?.message || "Đăng ký thất bại, vui lòng thử lại!";
            
            notification.error({
                message: "ĐĂNG KÝ THẤT BẠI",
                description: errorMsg
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-center mb-8">Đăng Ký</h1>
                
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item 
                        label="Email" 
                        name="email" 
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không đúng định dạng!" }
                        ]}
                    >
                        <Input size="large" placeholder="Enter email" />
                    </Form.Item>

                    <Form.Item 
                        label="Password" 
                        name="password" 
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu!" },
                            { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên!" }
                        ]}
                    >
                        <Input.Password size="large" placeholder="Enter password" />
                    </Form.Item>

                    <Form.Item 
                        label="Full Name" 
                        name="name" 
                        rules={[
                            { required: true, message: "Vui lòng nhập tên của bạn!" }
                        ]}
                    >
                        <Input size="large" placeholder="Enter full name" />
                    </Form.Item>

                    <Button 
                        loading={registerLoading} 
                        type="primary" 
                        htmlType="submit" 
                        size="large" 
                        block 
                        className="!h-11"
                    >
                        Register
                    </Button>
                </Form>

                <Divider />

                <div className="text-center space-y-3">
                    <div>
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="text-blue-500 font-medium">Đăng nhập</Link>
                    </div>
                    <Link to="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-black">
                        <ArrowLeftOutlined /> Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;