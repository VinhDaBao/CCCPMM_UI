import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, notification, Row, Divider, Upload, Avatar } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserApi, updateProfileApi } from '../util/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProfilePage = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [fileObject, setFileObject] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const auth = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // ================= GET PROFILE =================
    useEffect(() => {

        if (!auth?.user?.role) return;
        const fetchProfile = async () => {
            const res = await getUserApi(auth?.user?.role);
            if (res && res.user) {
                const user = res.user;

                const currentName = user.fullName && user.fullName !== "undefined" ? user.fullName : "";

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
    }, [form]);

    // ================= UPLOAD =================
    const beforeUpload = (file) => {
        setFileObject(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageUrl(e.target.result);
        };
        reader.readAsDataURL(file);
        return false; // Chặn upload mặc định
    };

    // ================= SUBMIT (CÁCH VƯỢT RÀO FORM) =================
    const handleDirectUpdate = async () => {
        setLoading(true);

        // Bắt trực tiếp chữ trong ô Input thay vì chờ Form gửi
        const directFullName = form.getFieldValue("fullName");
        console.log("==== DỮ LIỆU ĐÃ BẮT TRỰC TIẾP TỪ INPUT ====", directFullName);

        let avatarToSend = fileObject;
        if (!fileObject && typeof imageUrl === "string" && !imageUrl.startsWith("data:")) {
            avatarToSend = imageUrl;
        }

        const res = await updateProfileApi(directFullName, avatarToSend);

        setLoading(false);

        if (res && res.errCode === 0) {
            notification.success({
                message: "THÀNH CÔNG",
                description: "Cập nhật hồ sơ thành công!"
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
        } else {
            notification.error({
                message: "THẤT BẠI",
                description: res?.message ?? "Cập nhật hồ sơ thất bại!"
            });
        }
    };

    return (
        <Row justify={"center"} className="mt-8">
            <Col xs={24} md={16} lg={8}>
                <fieldset className="m-1 rounded-lg border border-gray-300 p-4">
                    <legend className="mx-auto mb-5 text-center text-2xl font-semibold">Profile</legend>
                    
                    {/* BỎ onFinish CỦA FORM ĐI VÌ NÓ BỊ LỖI */}
                    <Form form={form} layout='vertical'>
                        <Form.Item label="Email" name="email"><Input disabled /></Form.Item>
                        <Form.Item label="Role" name="role"><Input disabled /></Form.Item>

                        <Form.Item label="Full Name" name="fullName">
                            <Input prefix={<UserOutlined />} placeholder="Nhập tên của bạn..." />
                        </Form.Item>

                        {/* XÓA name="avatar" ĐỂ TRÁNH LỖI WARNING CỦA ANT DESIGN */}
                        <Form.Item label="Avatar">
                            <Upload listType="picture-card" showUploadList={false} beforeUpload={beforeUpload}>
                                <Avatar 
                                    size={100} 
                                    src={imageUrl ? (imageUrl.startsWith("data:") ? imageUrl : `${BACKEND_URL}${imageUrl}`) : null} 
                                    icon={<UserOutlined />} 
                                />
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            {/* THAY htmlType='submit' THÀNH SỰ KIỆN onClick TRỰC TIẾP */}
                            <Button type='primary' onClick={handleDirectUpdate} loading={loading} block>
                                Update Profile
                            </Button>
                        </Form.Item>
                    </Form>

                    <Link to={auth?.user?.role === "admin" ? "/" : "/"}><ArrowLeftOutlined /> Back</Link>
                    <Divider />
                    <div className="text-center text-gray-500">Update your personal information</div>
                </fieldset>
            </Col>
        </Row>
    );
};

export default ProfilePage;