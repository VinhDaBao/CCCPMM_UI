import React, {useState} from 'react';
import { notification } from 'antd';
import { createUserApi, verifyRegisterOtpApi} from '../util/api';
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
import CustomInput from '../components/common/CustomInput';

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const registerLoading = useSelector(
        state => state.auth.registerLoading
    );

    // Quản lý các bước: false là nhập thông tin, true là nhập OTP
    const [isVerifyStep, setIsVerifyStep] = useState(false);
    const [otp, setOtp] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');


    // Bước 1: Gửi thông tin đăng ký
    const handleRegister = async (e) => {
        e.preventDefault();
        dispatch(registerStart());

        const res = await createUserApi(name, email, password);

        if (res && (res.data || res.message?.includes("thành công"))) {

            notification.success({
                title: "Thông tin đã được ghi nhận!",
                description: "Vui lòng check email để nhận mã OTP xác nhận!"
            });
            setIsVerifyStep(true); //sang bước nhập otp

        } else {
            dispatch(registerFail("Lỗi tạo tài khoản"));
            notification.error({
                title: "Lỗi đăng ký!",
                description: res?.message || "Email này đã tồn tại"

            })
        }
    };

    // Bước 2: Xác thực mã OTP
        const handleVerifyOTP = async (e) => {
            e.preventDefault();
            try {
                const res = await verifyRegisterOtpApi(email, otp);
                if (res) {
                    dispatch(registerSuccess());
                    notification.success({ message: "Activation successful!", description: "Bây giờ bạn có thể đăng nhập." });
                    navigate("/login");
                }
            } catch (error) {
                notification.error({ message: "Incorrect or expired OTP code" });
            }
        };

        // Hàm quay lại
        const handleGoBack = () => {
            setIsVerifyStep(false);
            setOtp('');
            // Reset trạng thái error/loading trong Redux để bấm lại được
            dispatch(registerFail(null));
        };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-6">
        <div className="bg-white !p-10 md:!p-12 rounded-2xl shadow-xl w-full max-w-[400px] border border-gray-100">

            <div className="!mb-10 text-center">
                <h2 className="text-xl font-bold text-gray-800 uppercase">
                    {isVerifyStep ? "Xác Thực OTP" : "Đăng Ký"}
                </h2>
                <p className="text-gray-400 text-[12px] mt-1">
                    {isVerifyStep ? `Mã đã gửi đến ${email}` : "Hãy để chúng tôi hỗ trợ bạn !"}
                </p>
            </div>

            {!isVerifyStep ? (
                //Form đăng ký thông tin
                <form onSubmit={handleRegister} className="flex flex-col">
                    <CustomInput label="Họ và Tên" type="text" placeholder="Nhập tên" value={name} onChange={(e) => setName(e.target.value)} />
                    <CustomInput label="Email" type="email" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <CustomInput label="Mật khẩu" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

                    <button disabled={registerLoading} type="submit" className="w-full !mt-8 !bg-blue-600 !text-white !font-bold !py-3.5 !rounded-xl !transition-all">
                        {registerLoading ? 'Đang gửi...' : 'Nhận Mã OTP'}
                    </button>
                </form>
            ) : (
                /* FORM NHẬP OTP */
                <form onSubmit={handleVerifyOTP} className="flex flex-col">
                    <CustomInput
                        label="Mã OTP"
                        type="text"
                        placeholder="Nhập 6 số"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <button type="submit" className="w-full !mt-8 !bg-green-600 !text-white !font-bold !py-3.5 !rounded-xl !transition-all">
                        Xác Nhận & Kích Hoạt
                    </button>
                    <button type="button" onClick={handleGoBack} className="mt-4 !text-xs !text-gray-500 !py-3.5">
                        Thay đổi thông tin đăng ký?
                    </button>
                </form>
            )}

            <div className="!mt-10 text-center">
                <Link to="/login" className="text-[13px] text-blue-600 font-bold hover:underline">
                    Quay lại Đăng nhập
                </Link>
            </div>
        </div>
    </div>
    );
}
export default RegisterPage;
