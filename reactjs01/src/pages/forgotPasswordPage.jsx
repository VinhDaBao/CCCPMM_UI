import React from 'react';

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
    MailOutlined
} from '@ant-design/icons';

import { Link, useNavigate } from 'react-router-dom';

import { forgotPasswordApi } from '../util/api';

const ForgotPasswordPage = () => {

    const navigate = useNavigate();

    const onFinish = async (values) => {

        const { email } = values;

        console.log("EMAIL:", email);

        const res = await forgotPasswordApi(email);

        if (res && res.errCode === 0) {

            notification.success({
                message: "SEND OTP",
                description: res.message
            });

            navigate("/verify-otp", {
                state: {
                    email
                }
            });

        } else {

            notification.error({
                message: "SEND OTP",
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

                    <legend>Forgot Password</legend>

                    <Form
                        layout='vertical'
                        onFinish={onFinish}
                    >

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your email!"
                                }
                            ]}
                        >

                            <Input
                                prefix={<MailOutlined />}
                                placeholder='Enter your email'
                            />

                        </Form.Item>

                        <Form.Item>

                            <Button
                                type='primary'
                                htmlType='submit'
                                block
                            >
                                Send OTP
                            </Button>

                        </Form.Item>

                    </Form>

                    <Link to={"/login"}>
                        <ArrowLeftOutlined />
                        {" "}Back to Login
                    </Link>

                    <Divider />

                    <div style={{ textAlign: "center" }}>
                        Please check your email inbox after sending OTP
                    </div>

                </fieldset>

            </Col>
        </Row>
    )
}

export default ForgotPasswordPage;