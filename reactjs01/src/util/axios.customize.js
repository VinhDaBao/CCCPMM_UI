import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
});

instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    if (response && response.data) return response.data;
    return response;
}, async function (error) {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.message === 'jwt expired' && !originalRequest._retry) {
        
        originalRequest._retry = true; 

        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) {
                throw new Error("Không có Refresh Token");
            }

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/refresh-token`, {
                refreshToken: refreshToken
            });

            if (res.data && res.data.accessToken) {
                localStorage.setItem("access_token", res.data.accessToken);
                localStorage.setItem("refresh_token", res.data.refreshToken);

                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                
                return instance(originalRequest);
            }
        } catch (refreshError) {
            console.error("Refresh Token thất bại, bắt buộc đăng nhập lại:", refreshError);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login"; 
            return Promise.reject(refreshError);
        }
    }

    if (error?.response?.status === 401 && error.response?.data?.message !== 'jwt expired') {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login"; 
    }

    return error.response && error.response.data ? error.response.data : Promise.reject(error);
});

export default instance;