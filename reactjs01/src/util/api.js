import axios from './axios.customize';

const createCrudApi = (basePath) => ({
    create: (data) => axios.post(basePath, data),
    getAll: (params) => axios.get(basePath, { params }),
    getById: (id) => axios.get(`${basePath}/${id}`),
    update: (id, data) => axios.put(`${basePath}/${id}`, data),
    delete: (id) => axios.delete(`${basePath}/${id}`)
});

const workspaceApi = createCrudApi('/api/workspaces');
const notificationApi = createCrudApi('/api/notifications');
const paymentApi = createCrudApi('/api/payments');
const planApi = createCrudApi('/api/plans');
const subscriptionApi = createCrudApi('/api/subscriptions');


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

const getAllUsersApi = (queryParams) => {
    const queryString = new URLSearchParams(queryParams).toString();
    return axios.get(`/api/auth/all-users?${queryString}`);
};

const logoutApi = () => {
    return axios.post("/api/auth/logout");
};

const createWorkspaceApi = (data) => workspaceApi.create(data);
const getAllWorkspacesApi = () => workspaceApi.getAll();
const getWorkspaceByIdApi = (id) => workspaceApi.getById(id);
const updateWorkspaceApi = (id, data) => workspaceApi.update(id, data);
const deleteWorkspaceApi = (id) => workspaceApi.delete(id);

const createProjectApi = (workspaceId, data) => axios.post(`/api/workspaces/${workspaceId}/projects`, data);
const getAllProjectsApi = (workspaceId, params) => axios.get(`/api/workspaces/${workspaceId}/projects`, { params });
const getProjectByIdApi = (workspaceId, id) => axios.get(`/api/workspaces/${workspaceId}/projects/${id}`);
const updateProjectApi = (workspaceId, id, data) => axios.put(`/api/workspaces/${workspaceId}/projects/${id}`, data);
const deleteProjectApi = (workspaceId, id) => axios.delete(`/api/workspaces/${workspaceId}/projects/${id}`);
const duplicateProjectApi = (workspaceId, id) => axios.post(`/api/workspaces/${workspaceId}/projects/${id}/duplicate`);

const createCharacterApi = (workspaceId, data) => axios.post(`/api/workspaces/${workspaceId}/characters`, data);
const getAllCharactersApi = (workspaceId, params) => axios.get(`/api/workspaces/${workspaceId}/characters`, { params });
const getCharacterByIdApi = (workspaceId, id) => axios.get(`/api/workspaces/${workspaceId}/characters/${id}`);
const updateCharacterApi = (workspaceId, id, data) => axios.put(`/api/workspaces/${workspaceId}/characters/${id}`, data);
const deleteCharacterApi = (workspaceId, id) => axios.delete(`/api/workspaces/${workspaceId}/characters/${id}`);

const createBlockApi = (workspaceId, projectId, data) => axios.post(`/api/workspaces/${workspaceId}/projects/${projectId}/blocks`, data);
const getAllBlocksApi = (workspaceId, projectId, params) => axios.get(`/api/workspaces/${workspaceId}/projects/${projectId}/blocks`, { params });
const getBlockByIdApi = (workspaceId, projectId, id) => axios.get(`/api/workspaces/${workspaceId}/projects/${projectId}/blocks/${id}`);
const updateBlockApi = (workspaceId, projectId, id, data) => axios.put(`/api/workspaces/${workspaceId}/projects/${projectId}/blocks/${id}`, data);
const deleteBlockApi = (workspaceId, projectId, id) => axios.delete(`/api/workspaces/${workspaceId}/projects/${projectId}/blocks/${id}`);

const createNotificationApi = (data) => notificationApi.create(data);
const getAllNotificationsApi = () => notificationApi.getAll();
const getNotificationByIdApi = (id) => notificationApi.getById(id);
const updateNotificationApi = (id, data) => notificationApi.update(id, data);
const deleteNotificationApi = (id) => notificationApi.delete(id);

const createPaymentApi = (data) => paymentApi.create(data);
const getAllPaymentsApi = () => paymentApi.getAll();
const getPaymentByIdApi = (id) => paymentApi.getById(id);
const updatePaymentApi = (id, data) => paymentApi.update(id, data);
const deletePaymentApi = (id) => paymentApi.delete(id);

const createPlanApi = (data) => planApi.create(data);
const getAllPlansApi = () => planApi.getAll();
const getPlanByIdApi = (id) => planApi.getById(id);
const updatePlanApi = (id, data) => planApi.update(id, data);
const deletePlanApi = (id) => planApi.delete(id);

const createSnippetApi = (workspaceId, data) => axios.post(`/api/workspaces/${workspaceId}/snippets`, data);
const getAllSnippetsApi = (workspaceId, params) => axios.get(`/api/workspaces/${workspaceId}/snippets`, { params });
const getSnippetByIdApi = (workspaceId, id) => axios.get(`/api/workspaces/${workspaceId}/snippets/${id}`);
const updateSnippetApi = (workspaceId, id, data) => axios.put(`/api/workspaces/${workspaceId}/snippets/${id}`, data);
const deleteSnippetApi = (workspaceId, id) => axios.delete(`/api/workspaces/${workspaceId}/snippets/${id}`);

const createSubscriptionApi = (data) => subscriptionApi.create(data);
const getAllSubscriptionsApi = () => subscriptionApi.getAll();
const getSubscriptionByIdApi = (id) => subscriptionApi.getById(id);
const updateSubscriptionApi = (id, data) => subscriptionApi.update(id, data);
const deleteSubscriptionApi = (id) => subscriptionApi.delete(id);

const createProjectAssetApi = (workspaceId, projectId, data) => axios.post(`/api/workspaces/${workspaceId}/projects/${projectId}/project-assets`, data);
const attachProjectAssetsApi = (workspaceId, projectId, assetIds) => axios.post(`/api/workspaces/${workspaceId}/projects/${projectId}/project-assets/attach`, { assetIds });
const getAllProjectAssetsApi = (workspaceId, projectId, params) => axios.get(`/api/workspaces/${workspaceId}/projects/${projectId}/project-assets`, { params });
const getProjectAssetByIdApi = (workspaceId, projectId, id) => axios.get(`/api/workspaces/${workspaceId}/projects/${projectId}/project-assets/${id}`);
const updateProjectAssetApi = (workspaceId, projectId, id, data) => axios.put(`/api/workspaces/${workspaceId}/projects/${projectId}/project-assets/${id}`, data);
const deleteProjectAssetApi = (workspaceId, projectId, id) => axios.delete(`/api/workspaces/${workspaceId}/projects/${projectId}/project-assets/${id}`);

const createProjectSnapshotApi = (workspaceId, projectId) => axios.post(`/api/workspaces/${workspaceId}/projects/${projectId}/snapshots`, {});
const getProjectSnapshotsApi = (workspaceId, projectId) => axios.get(`/api/workspaces/${workspaceId}/projects/${projectId}/snapshots`);
const restoreProjectSnapshotApi = (workspaceId, projectId, snapshotId) => axios.post(`/api/workspaces/${workspaceId}/projects/${projectId}/snapshots/${snapshotId}/restore`);

const getWorkspaceActivityLogsApi = (workspaceId) => axios.get(`/api/workspaces/${workspaceId}/activity-logs`);

const sendSystemNotificationApi = (data) => axios.post('/api/notifications/system', data);

const workspaceInviteApi = {
    invite: (data) =>
        axios.post(`/api/workspace-invites/${data.workspaceId}/invite`, data),

    getByWorkspace: (workspaceId) =>
        axios.get(`/api/workspace-invites/workspace/${workspaceId}`),

    getByToken: (token) =>
        axios.get(`/api/workspace-invites/invite/${token}`),

    accept: (token) =>
        axios.post("/api/workspace-invites/accept", { token }),

    cancel: (workspaceId, token) =>
        axios.delete(`/api/workspace-invites/${workspaceId}/invite/${token}`),
};


const getWorkspaceMembers = async (workspaceId) => {
    return axios.get(`/api/workspace-members/${workspaceId}/members`);
};

const changeMemberRole = async ({ workspaceId, memberId, role }) => {
    return axios.patch(
        `/api/workspace-members/${workspaceId}/members/${memberId}/role`,
        { role }
    );
};

const removeMember = async ({ workspaceId, memberId }) => {
    return axios.delete(
        `/api/workspace-members/${workspaceId}/members/${memberId}`
    );
};

const leaveWorkspace = async (workspaceId) => {
    return axios.post(`/api/workspace-members/${workspaceId}/leave`);
};


const refreshTokenApi = (refreshToken) => {
    return axios.post("/api/auth/refresh-token", { refreshToken });
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

const getAssetUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    let normalized = url.replace(/\\/g, '/');
    normalized = normalized.replace(/^(src\/public\/images|public\/images|src\/images|public)/, '/images');
    if (!normalized.startsWith('/images') && !normalized.startsWith('/')) {
        normalized = '/' + normalized;
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8088';
    return `${backendUrl.replace(/\/$/, '')}${normalized}`;
}
// WORLD BUILDING (Của team)
// Hàm 1: Lấy toàn bộ cấu trúc sơ đồ (Nodes + Edges) từ Backend dựa vào WorldId
const getWorldGraphApi = (worldId) => {
    return axios.get(`/api/worlds/graph/${worldId}`);
};

// Hàm 2: Gửi toàn bộ mảng sơ đồ hiện tại xuống để Backend lưu đè vào MongoDB
const saveWorldGraphApi = (worldId, nodes, edges) => {
    return axios.post(`/api/worlds/graph/save/${worldId}`, {
        nodes,
        edges
    });
};

// TOGGLE USER STATUS (Của anh em mình)
const synthesizeTtsApi = (text, voice) => {
    return axios.post("/api/tts/synthesize", { text, voice });
};

const getTtsVoicesApi = () => {
    return axios.get("/api/tts/voices");
};

const toggleUserStatusApi = (targetUserId) => {
    return axios.post("/api/auth/toggle-user-status", { targetUserId });
};

const getBillingInfoApi = () => {
    return axios.get("/api/auth/billing-info");
};

const createPayOSLinkApi = (planId, amount) => {
    return axios.post("/api/payments/create-payos-link", { planId, amount });
};

export const getAdminDashboardStatsApi = () => {
    return axios.get('/api/auth/admin/dashboard-stats'); 
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
    createWorkspaceApi,
    getAllWorkspacesApi,
    getWorkspaceByIdApi,
    updateWorkspaceApi,
    deleteWorkspaceApi,
    createProjectApi,
    getAllProjectsApi,
    getProjectByIdApi,
    updateProjectApi,
    deleteProjectApi,
    createCharacterApi,
    getAllCharactersApi,
    getCharacterByIdApi,
    updateCharacterApi,
    deleteCharacterApi,
    createBlockApi,
    getAllBlocksApi,
    getBlockByIdApi,
    updateBlockApi,
    deleteBlockApi,
    createNotificationApi,
    getAllNotificationsApi,
    getNotificationByIdApi,
    updateNotificationApi,
    deleteNotificationApi,
    createPaymentApi,
    getAllPaymentsApi,
    getPaymentByIdApi,
    updatePaymentApi,
    deletePaymentApi,
    createPlanApi,
    getAllPlansApi,
    getPlanByIdApi,
    updatePlanApi,
    deletePlanApi,
    createSnippetApi,
    getAllSnippetsApi,
    getSnippetByIdApi,
    updateSnippetApi,
    deleteSnippetApi,
    createSubscriptionApi,
    getAllSubscriptionsApi,
    getSubscriptionByIdApi,
    updateSubscriptionApi,
    deleteSubscriptionApi,
    createProjectAssetApi,
    attachProjectAssetsApi,
    getAllProjectAssetsApi,
    getProjectAssetByIdApi,
    updateProjectAssetApi,
    deleteProjectAssetApi,
    duplicateProjectApi,
    createProjectSnapshotApi,
    getProjectSnapshotsApi,
    restoreProjectSnapshotApi,
    getWorkspaceActivityLogsApi,
    sendSystemNotificationApi,
    workspaceInviteApi,
    getWorkspaceMembers,
    changeMemberRole,
    removeMember,
    leaveWorkspace,
    refreshTokenApi,
    logoutApi,
    getAllAssetsApi,
    uploadAssetApi,
    getWorkspaceTagsApi,
    updateAssetApi,
    deleteAssetApi,
    getAssetUrl,
    getWorldGraphApi,
    saveWorldGraphApi,
    toggleUserStatusApi,
    synthesizeTtsApi,
    getTtsVoicesApi,
    getBillingInfoApi,
    createPayOSLinkApi
};
