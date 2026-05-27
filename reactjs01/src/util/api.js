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


export {
    createUserApi,
    loginApi,
    getUserApi,
    forgotPasswordApi,
    verifyOtpApi,
    resetPasswordApi,
    updateProfileApi,
    verifyRegisterOtpApi,
    getAllUsersApi
};