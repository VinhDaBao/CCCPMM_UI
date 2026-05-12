import React, { useContext } from 'react';
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
const LoginPage = () => {
    const navigate = useNavigate();
    //const { setAuth } = useContext(AuthContext);
    const dispatch = useDispatch();
    const onFinish = async (values) => {
        const { email, password } = values;

        const res = await loginApi(email, password);
        console.log("LOGIN RESPONSE:", res);
        if (res && res.token) {
            localStorage.setItem("access_token", res.token);
            notification.success({
                message: "LOGIN USER",
                description: "Success"
            });
            dispatch(
                loginSuccess({
                    email: res?.user?.email ?? "",
                    name: res?.user?.name ?? "",
                })
            );
            navigate("/user");
        } else {
            notification.error({
                message: "LOGIN USER",
                description: res?.message ?? "Error"
            })
        }
    };
    return (
        <Row justify={"center"} style={{ marginTop: "30px" }}>
            <Col xs={24} md={16} lg={8}>
                <fieldset style={{
                    padding: "15px",
                    margin: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px"
                }}>
                    <legend>Đăng Nhập</legend>
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
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Login
                            </Button>
                        </Form.Item>

                    </Form>
                    <Link to={"/"}><ArrowLeftOutlined /> Back to Home </Link>
                    <Divider />
                    <div style={{ textAlign: "center" }}>
                        <span>Don't have an account? </span>
                        <Link to={"/register"}>Register now</Link>
                    </div>
                </fieldset>
            </Col>
        </Row>
    )
}

export default LoginPage;
