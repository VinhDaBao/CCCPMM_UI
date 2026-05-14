import React, { useState } from 'react';
import { notification } from 'antd'; // Chỉ lấy logic thông báo
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import CustomInput from '../components/common/CustomInput';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await loginApi(email, password);
        if (res && res.token) {
            localStorage.setItem("access_token", res.token);
            notification.success({ message: "Đăng nhập thành công" });
            dispatch(loginSuccess({ email: res?.user?.email ?? "", name: res?.user?.name ?? "" }));
            navigate("/user");
        } else {
            notification.error({ message: "Lỗi đăng nhập", description: res?.message || "Lỗi hệ thống" });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-6">
            <div className="bg-white !p-10 md:!p-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[400px] border border-gray-100">

                <div className="!mb-10 text-center">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Đăng Nhập</h2>
                    <p className="text-gray-400 text-[12px] mt-1">Chào mừng bạn đến với SSM</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <CustomInput label="Email" type="email" placeholder="Nhập email..." value={email} onChange={(e) => setEmail(e.target.value)} />
                    <CustomInput label="Mật khẩu" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />


                    <button type="submit" className="w-full !mt-8 bg-[#1677ff] hover:bg-[#4096ff] text-white !text-base !font-bold !py-3.5 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
                        Đăng Nhập
                    </button>
                </form>


                <div className="!mt-10 text-center">
                    <Link to="/" className="text-[13px] text-gray-500 hover:text-[#1677ff] flex items-center justify-center gap-2">
                        <ArrowLeftOutlined className="text-[10px]" /> Quay về trang chủ
                    </Link>
                </div>

                <div className="flex items-center !my-8">
                    <div className="flex-grow h-[1px] bg-gray-100"></div>
                    <span className="!mx-4 text-gray-300 text-[10px] uppercase font-bold tracking-widest">Hoặc</span>
                    <div className="flex-grow h-[1px] bg-gray-100"></div>
                </div>


                <div className="text-center !pb-4">
                    <span className="text-gray-400 text-[13px]">Bạn chưa có tài khoản? </span>
                    <Link to="/register" className="text-[#1677ff] font-bold hover:underline text-[13px]">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;