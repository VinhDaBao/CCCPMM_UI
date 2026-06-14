import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    return axios.post("/api/auth/register", {
        name,
        email,
        password
    });
};

const verifyRegisterOtpApi = (email, otp) => {
    return axios.post("/api/auth/verify-otp", { email, otp });
};

const loginApi = (email, password) => {
    return axios.post("/api/auth/login", {
        email,
        password
    });
};

const getUserApi = (role) => {
    const endpoint =
        role === "admin"
            ? "/api/auth/admin/profile"
            : "/api/auth/user/profile";

    return axios.get(endpoint);
};

const forgotPasswordApi = (email) => {
    return axios.post("/api/auth/forgot-password", { email });
};

const verifyOtpApi = (email, otp) => {
    return axios.post("/api/auth/verify-forgot-password-otp", {
        email,
        otp
    });
};

const resetPasswordApi = (email, newPassword) => {
    return axios.post("/api/auth/reset-password", {
        email,
        newPassword
    });
};


const updateProfileApi = (fullName, avatarFile) => {
    const formData = new FormData();
    
    formData.append("fullName", fullName ?? ""); 
    
    if (avatarFile && typeof avatarFile !== "string") {
        formData.append("avatar", avatarFile); 
    } else if (typeof avatarFile === "string") {
        formData.append("avatar", avatarFile);
    }

    return axios.put("/api/auth/edit-profile", formData);
};

const getAllUsersApi = () => {
    return axios.get("/api/auth/all-users");
};

const refreshTokenApi = (refreshToken) => {
    return axios.post("/api/auth/refresh-token", { refreshToken });
};

const logoutApi = () => {
    return axios.post("/api/auth/logout");
};

// ==========================================
// ĐÃ BỎ CHỮ 'export' Ở TRƯỚC CÁC HÀM NÀY
// ==========================================
const getAllAssetsApi = (workspaceId, filterOptions = {}) => {
    return axios.get('/api/assets', {
        params: {
            workspaceId,
            ...filterOptions
        }
    });
};

const uploadAssetApi = (workspaceId, file, tags) => {
    const formData = new FormData();
    formData.append('workspaceId', workspaceId);
    formData.append('fileMedia', file);
    if (tags) formData.append('tags', tags);

    return axios.post('/api/assets/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const getWorkspaceTagsApi = (workspaceId) => {
    return axios.get('/api/assets/tags', {
        params: { workspaceId }
    });
};

const updateAssetApi = (assetId, data) => {
    return axios.put(`/api/assets/${assetId}`, data);
};

const deleteAssetApi = (assetId) => {
    return axios.delete(`/api/assets/${assetId}`);
};

export {
    createUserApi,
    loginApi,
    getUserApi,
    forgotPasswordApi,
    verifyOtpApi,
    resetPasswordApi,
    updateProfileApi,
    verifyRegisterOtpApi,
    getAllUsersApi,
    refreshTokenApi,
    logoutApi,
    getAllAssetsApi,
    uploadAssetApi,
    getWorkspaceTagsApi,
    updateAssetApi,
    deleteAssetApi
};