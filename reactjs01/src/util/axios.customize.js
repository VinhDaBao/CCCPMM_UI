import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // TRƯỜNG HỢP 1: Token hết hạn (jwt expired) -> Kích hoạt Auto-Refresh
    if (
        error.response?.status === 401 &&
        error.response?.data?.message === "jwt expired" &&
        !originalRequest._retry
    ) {
        // Nếu đang có thằng khác xin token rồi thì xếp hàng chờ
        if (isRefreshing) {
            return new Promise(function (resolve) {
                subscribeTokenRefresh(function (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(instance(originalRequest));
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
                throw new Error("Không có Refresh Token");
            }

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh-token`,
                {
                    refreshToken: refreshToken
                }
            );

            if (res.data && res.data.accessToken) {
                localStorage.setItem("access_token", res.data.accessToken);
                localStorage.setItem("refresh_token", res.data.refreshToken);

                // Thông báo cho các request đang xếp hàng biết là có token mới rồi
                onRefreshed(res.data.accessToken);

                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return instance(originalRequest);
            }
        } catch (refreshError) {
            console.error(
                "Refresh Token thất bại, bắt buộc đăng nhập lại:",
                refreshError
            );

            refreshSubscribers = [];
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }

    // TRƯỜNG HỢP 2: Lỗi 401 nhưng KHÔNG PHẢI do hết hạn token (Vd: Bị Admin khóa, sai token)
    if (
        error?.response?.status === 401 &&
        error.response?.data?.message !== "jwt expired"
    ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
    }

    return error.response && error.response.data
        ? error.response.data
        : Promise.reject(error);
});

export default instance;