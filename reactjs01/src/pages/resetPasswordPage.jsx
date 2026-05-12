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
    LockOutlined
} from '@ant-design/icons';

import {
    Link,
    useLocation,
    useNavigate
} from 'react-router-dom';

import { resetPasswordApi } from '../util/api';

const ResetPasswordPage = () => {

    const navigate = useNavigate();

    const location = useLocation();

    const email = location?.state?.email;

    const onFinish = async (values) => {

        const {
            password,
            confirmPassword
        } = values;

        if (password !== confirmPassword) {

            notification.error({
                message: "RESET PASSWORD",
                description: "Passwords do not match"
            });

            return;
        }

        console.log("RESET PASSWORD:", password);

        const res = await resetPasswordApi(
            email,
            password
        );

        if (res && res.errCode === 0) {

            notification.success({
                message: "RESET PASSWORD",
                description: res.message
            });

            navigate("/login");

        } else {

            notification.error({
                message: "RESET PASSWORD",
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

                    <legend>Reset Password</legend>

                    <Form
                        layout='vertical'
                        onFinish={onFinish}
                    >

                        <Form.Item
                            label="New Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input new password!"
                                }
                            ]}
                        >

                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder='Enter new password'
                            />

                        </Form.Item>

                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm password!"
                                }
                            ]}
                        >

                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder='Confirm password'
                            />

                        </Form.Item>

                        <Form.Item>

                            <Button
                                type='primary'
                                htmlType='submit'
                                block
                            >
                                Reset Password
                            </Button>

                        </Form.Item>

                    </Form>

                    <Link to={"/login"}>
                        <ArrowLeftOutlined />
                        {" "}Back to Login
                    </Link>

                    <Divider />

                    <div style={{ textAlign: "center" }}>
                        Your password will be updated immediately
                    </div>

                </fieldset>

            </Col>
        </Row>
    )
}

export default ResetPasswordPage;