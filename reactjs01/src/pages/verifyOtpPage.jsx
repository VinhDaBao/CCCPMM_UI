import React, { useEffect, useState } from 'react';

import {
    Button,
    Col,
    Form,
    Input,
    notification,
    Row,
    Divider
} from 'antd';

import {
    ArrowLeftOutlined,
    SafetyOutlined
} from '@ant-design/icons';

import {
    Link,
    useLocation,
    useNavigate
} from 'react-router-dom';

import {
    verifyOtpApi,
    forgotPasswordApi
} from '../util/api';

const VerifyOtpPage = () => {

    const navigate = useNavigate();

    const location = useLocation();

    const email = location?.state?.email;

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

        console.log("OTP:", otp);

        const res = await verifyOtpApi(
            email,
            otp
        );

        if (res && res.errCode === 0) {

            notification.success({
                message: "VERIFY OTP",
                description: res.message
            });

            navigate("/reset-password", {
                state: {
                    email
                }
            });

        } else {

            notification.error({
                message: "VERIFY OTP",
                description: res?.message ?? "Error"
            });
        }
    };

    const handleResendOtp = async () => {

        const res = await forgotPasswordApi(email);

        if (res && res.errCode === 0) {

            notification.success({
                message: "RESEND OTP",
                description: res.message
            });

            setCountdown(120);

        } else {

            notification.error({
                message: "RESEND OTP",
                description: res?.message ?? "Error"
            });
        }
    };

    return (
        <Row justify={"center"} style={{ marginTop: "30px" }}>
            <Col xs={24} md={16} lg={8}>

                <fieldset
                    style={{
                        padding: "15px",
                        margin: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}
                >

                    <legend>Verify OTP</legend>

                    <Form
                        layout='vertical'
                        onFinish={onFinish}
                    >

                        <Form.Item
                            label="OTP Code"
                            name="otp"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input OTP!"
                                }
                            ]}
                        >

                            <Input
                                prefix={<SafetyOutlined />}
                                placeholder='Enter OTP'
                            />

                        </Form.Item>

                        <div
                            style={{
                                marginBottom: "15px",
                                color: countdown <= 10 ? "red" : "black"
                            }}
                        >
                            OTP expires in: {formatTime(countdown)}
                        </div>

                        <Form.Item>

                            <Button
                                type='primary'
                                htmlType='submit'
                                block
                            >
                                Verify OTP
                            </Button>

                        </Form.Item>

                    </Form>

                    <Link to={"/login"}>
                        <ArrowLeftOutlined />
                        {" "}Back to Login
                    </Link>

                    <Divider />

                    <div style={{ textAlign: "center" }}>

                        Didn't receive OTP?{" "}

                        <Button
                            type='link'
                            disabled={countdown > 0}
                            onClick={handleResendOtp}
                        >
                            Resend OTP
                        </Button>

                    </div>

                </fieldset>

            </Col>
        </Row>
    )
}

export default VerifyOtpPage;