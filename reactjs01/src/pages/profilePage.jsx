import React, { useEffect, useState } from 'react';

import {
    Button,
    Col,
    Form,
    Input,
    notification,
    Row,
    Divider,
    Upload,
    Avatar
} from 'antd';

import {
    ArrowLeftOutlined,
    UserOutlined
} from '@ant-design/icons';

import { Link } from 'react-router-dom';

import {
    getUserApi,
    updateProfileApi
} from '../util/api';

const BACKEND_URL = "http://localhost:8088";

const ProfilePage = () => {

    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);

    const [fileObject, setFileObject] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);

    // ================= GET PROFILE =================
    useEffect(() => {

        const fetchProfile = async () => {

            const res = await getUserApi();

            if (res && res.user) {

                const user = res.user.user;

                form.setFieldsValue({
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    avatar: user.avatar
                });

                if (user.avatar) {
                    setImageUrl(user.avatar);
                }
            }
        };

        fetchProfile();

    }, []);

    // ================= UPLOAD (FIXED BEFOREUPLOAD) =================
    const beforeUpload = (file) => {

        setFileObject(file); // lưu file thật

        // preview ảnh
        const reader = new FileReader();

        reader.onload = (e) => {
            setImageUrl(e.target.result);
        };

        reader.readAsDataURL(file);

        return false; // chặn auto upload
    };

    // ================= SUBMIT =================
    const onFinish = async (values) => {

        setLoading(true);

        let avatarToSend = fileObject;

        if (
            !fileObject &&
            typeof imageUrl === "string" &&
            !imageUrl.startsWith("data:")
        ) {
            avatarToSend = imageUrl;
        }

        const res = await updateProfileApi(
            values.fullName,
            avatarToSend
        );

        setLoading(false);

        if (res && res.errCode === 0) {

            notification.success({
                message: "UPDATE PROFILE",
                description: "Cập nhật hồ sơ thành công!"
            });

            if (res.user) {

                form.setFieldsValue({
                    fullName: res.user.fullName,
                    avatar: res.user.avatar,
                });

                setImageUrl(res.user.avatar);
                setFileObject(null);
            }

        } else {

            notification.error({
                message: "UPDATE PROFILE",
                description: res?.message ?? "Cập nhật hồ sơ thất bại!"
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

                    <legend>Profile</legend>

                    <Form
                        form={form}
                        layout='vertical'
                        onFinish={onFinish}
                    >

                        <Form.Item label="Email" name="email">
                            <Input disabled />
                        </Form.Item>

                        <Form.Item label="Role" name="role">
                            <Input disabled />
                        </Form.Item>

                        <Form.Item label="Full Name" name="fullName">
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>

                        {/* ================= AVATAR (FIXED BEFOREUPLOAD) ================= */}
                        <Form.Item label="Avatar" name="avatar">

                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                            >

                                <Avatar
                                    size={100}
                                    src={
                                        imageUrl
                                            ? (imageUrl.startsWith("data:")
                                                ? imageUrl
                                                : `${BACKEND_URL}${imageUrl}`)
                                            : null
                                    }
                                    icon={<UserOutlined />}
                                />

                            </Upload>

                        </Form.Item>

                        <Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                loading={loading}
                                block
                            >
                                Update Profile
                            </Button>
                        </Form.Item>

                    </Form>

                    <Link to={"/user"}>
                        <ArrowLeftOutlined /> Back
                    </Link>

                    <Divider />

                    <div style={{ textAlign: "center" }}>
                        Update your personal information
                    </div>

                </fieldset>

            </Col>

        </Row>
    );
};

export default ProfilePage;