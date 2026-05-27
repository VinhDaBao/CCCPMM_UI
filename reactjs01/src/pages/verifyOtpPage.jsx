import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, notification, Row, Divider } from 'antd';
import { ArrowLeftOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyOtpApi, verifyRegisterOtpApi, forgotPasswordApi } from '../util/api';

const VerifyOtpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location?.state?.email;
    const type = location?.state?.type; 

    const [countdown, setCountdown] = useState(300);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const onFinish = async (values) => {
        const { otp } = values;

        if (type === "register") {
            const res = await verifyRegisterOtpApi(email, otp);
            if (res && res.errCode === 0) {
                notification.success({ message: "KÍCH HOẠT TÀI KHOẢN", description: res.message });
                navigate("/login"); 
            } else {
                notification.error({ message: "KÍCH HOẠT THẤT BẠI", description: res?.message || "Mã OTP sai hoặc hết hạn!" });
            }
        } else {
            const res = await verifyOtpApi(email, otp);
            if (res && res.errCode === 0) {
                notification.success({ message: "XÁC THỰC THÀNH CÔNG", description: res.message });
                navigate("/reset-password", { state: { email } });
            } else {
                notification.error({ message: "XÁC THỰC THẤT BẠI", description: res?.message || "Error" });
            }
        }
    };

    const handleResendOtp = async () => {
        const res = await forgotPasswordApi(email);
        if (res && res.errCode === 0) {
            notification.success({ message: "RESEND OTP", description: res.message });
            setCountdown(120);
        } else {
            notification.error({ message: "RESEND OTP", description: res?.message ?? "Error" });
        }
    };

    return (
        <Row justify={"center"} className="mt-8">
            <Col xs={24} md={16} lg={8}>
                <fieldset className="m-1 rounded-lg border border-gray-300 p-4">
                    <legend className="mx-auto mb-5 text-center text-2xl font-semibold">
                        {type === "register" ? "Kích Hoạt Tài Khoản" : "Verify OTP"}
                    </legend>

                    <Form layout='vertical' onFinish={onFinish}>
                        <Form.Item label="OTP Code" name="otp" rules={[{ required: true, message: "Please input OTP!" }]}>
                            <Input prefix={<SafetyOutlined />} placeholder='Enter OTP' />
                        </Form.Item>

                        <div className={`mb-4 ${countdown <= 10 ? "text-red-500" : "text-gray-700"}`}>
                            OTP expires in: {formatTime(countdown)}
                        </div>

                        <Form.Item>
                            <Button type='primary' htmlType='submit' block>
                                {type === "register" ? "Kích hoạt ngay" : "Verify OTP"}
                            </Button>
                        </Form.Item>
                    </Form>

                    <Link to={"/login"}><ArrowLeftOutlined /> Back to Login</Link>
                    <Divider />
                    <div className="text-center">
                        Didn't receive OTP?{" "}
                        <Button type='link' disabled={countdown > 0} onClick={handleResendOtp}>
                            Resend OTP
                        </Button>
                    </div>
                </fieldset>
            </Col>
        </Row>
    );
};

export default VerifyOtpPage;