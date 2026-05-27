import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
});

// Thêm Interceptor để tự động gắn Token vào mỗi request
instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    if (response && response.data) return response.data;
    return response;
}, function (error) {
    // Nếu token hết hạn hoặc lỗi xác thực (401), xóa token và cho về login
    if (error?.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login"; // Tự động văng về login
    }
    return Promise.reject(error);
});

export default instance;