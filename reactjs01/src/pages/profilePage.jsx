import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, notification, Row, Divider, Upload, Avatar } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserApi, updateProfileApi } from '../util/api';
import { loginSuccess } from "../redux/authSlice";
import { useTranslation } from 'react-i18next';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProfilePage = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [fileObject, setFileObject] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const auth = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!auth?.user?.role) return;

        const fetchProfile = async () => {
            const res = await getUserApi(auth?.user?.role);

            if (res && res.user) {
                const user = res.user;

                const currentName =
                    user.fullName && user.fullName !== "undefined"
                        ? user.fullName
                        : "";

                form.setFieldsValue({
                    email: user.email,
                    role: user.role,
                    fullName: currentName,
                    avatar: user.avatar
                });

                if (user.avatar) {
                    setImageUrl(user.avatar);
                }
            }
        };

        fetchProfile();
    }, [form, auth?.user?.role]);

    const beforeUpload = (file) => {
        setFileObject(file);

        const reader = new FileReader();

        reader.onload = (e) => {
            setImageUrl(e.target.result);
        };

        reader.readAsDataURL(file);

        return false;
    };

    const handleDirectUpdate = async () => {
    setLoading(true);

    try {
        const directFullName =
            form.getFieldValue("fullName");

        let avatarToSend = fileObject;

        if (
            !fileObject &&
            typeof imageUrl === "string" &&
            !imageUrl.startsWith("data:")
        ) {
            avatarToSend = imageUrl;
        }

        const res = await updateProfileApi(
            directFullName,
            avatarToSend
        );

        notification.success({
            message: t('profile_page.success'),
            description:
                res?.message ??
                t('profile_page.updated_success'),
        });

        dispatch(loginSuccess(res.user));

        if (res.user) {
            form.setFieldsValue({
                fullName: res.user.fullName,
                avatar: res.user.avatar,
            });

            setImageUrl(res.user.avatar);
            setFileObject(null);
        }
    } catch (error) {
        notification.error({
            message: t('profile_page.failed'),
            description:
                error?.response?.data?.message ||
                error?.message ||
                t('profile_page.updated_failed'),
        });
    } finally {
        setLoading(false);
    }
};

    return (
        <Row justify={"center"} className="mt-8">
            <Col xs={24} md={16} lg={8}>
                <fieldset className="m-1 rounded-lg border border-gray-300 p-4">
                    <legend className="mx-auto mb-5 text-center text-2xl font-semibold">
                        {t('profile_page.title')}
                    </legend>

                    <Form form={form} layout="vertical">
                        <Form.Item label={t('profile_page.email')} name="email">
                            <Input disabled />
                        </Form.Item>

                        <Form.Item label={t('profile_page.role')} name="role">
                            <Input disabled />
                        </Form.Item>

                        <Form.Item label={t('profile_page.full_name')} name="fullName">
                            <Input
                                prefix={<UserOutlined />}
                                placeholder={t('profile_page.full_name_placeholder')}
                            />
                        </Form.Item>

                        <Form.Item label={t('profile_page.avatar')}>
                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                            >
                                <Avatar
                                    size={100}
                                    src={
                                        imageUrl
                                            ? imageUrl.startsWith("data:")
                                                ? imageUrl
                                                : `${BACKEND_URL}${imageUrl}`
                                            : null
                                    }
                                    icon={<UserOutlined />}
                                />
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                onClick={handleDirectUpdate}
                                loading={loading}
                                block
                            >
                                {t('profile_page.update_profile')}
                            </Button>
                        </Form.Item>
                    </Form>

                    <Link to={auth?.user?.role === "admin" ? "/" : "/"}>
                        <ArrowLeftOutlined /> {t('profile_page.back')}
                    </Link>

                    <Divider />

                    <div className="text-center text-gray-500">
                        {t('profile_page.update_personal_info')}
                    </div>
                </fieldset>
            </Col>
        </Row>
    );
};

export default ProfilePage;