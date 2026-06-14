import axios from './axios.customize';


const createCrudApi = (basePath) => ({
    create: (data) => axios.post(basePath, data),
    getAll: () => axios.get(basePath),
    getById: (id) => axios.get(`${basePath}/${id}`),
    update: (id, data) => axios.put(`${basePath}/${id}`, data),
    delete: (id) => axios.delete(`${basePath}/${id}`)
});

const workspaceApi = createCrudApi('/api/workspaces');
const projectApi = createCrudApi('/api/projects');
const characterApi = createCrudApi('/api/characters');
const blockApi = createCrudApi('/api/blocks');
const notificationApi = createCrudApi('/api/notifications');
const paymentApi = createCrudApi('/api/payments');
const planApi = createCrudApi('/api/plans');
const snippetApi = createCrudApi('/api/snippets');
const subscriptionApi = createCrudApi('/api/subscriptions');
const projectAssetApi = createCrudApi('/api/project-assets');
const workspaceMemberApi = createCrudApi('/api/workspace-members');


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

const createWorkspaceApi = (data) => workspaceApi.create(data);
const getAllWorkspacesApi = () => workspaceApi.getAll();
const getWorkspaceByIdApi = (id) => workspaceApi.getById(id);
const updateWorkspaceApi = (id, data) => workspaceApi.update(id, data);
const deleteWorkspaceApi = (id) => workspaceApi.delete(id);

const createProjectApi = (data) => projectApi.create(data);
const getAllProjectsApi = () => projectApi.getAll();
const getProjectByIdApi = (id) => projectApi.getById(id);
const updateProjectApi = (id, data) => projectApi.update(id, data);
const deleteProjectApi = (id) => projectApi.delete(id);

const createCharacterApi = (data) => characterApi.create(data);
const getAllCharactersApi = () => characterApi.getAll();
const getCharacterByIdApi = (id) => characterApi.getById(id);
const updateCharacterApi = (id, data) => characterApi.update(id, data);
const deleteCharacterApi = (id) => characterApi.delete(id);

const createBlockApi = (data) => blockApi.create(data);
const getAllBlocksApi = () => blockApi.getAll();
const getBlockByIdApi = (id) => blockApi.getById(id);
const updateBlockApi = (id, data) => blockApi.update(id, data);
const deleteBlockApi = (id) => blockApi.delete(id);

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

const createSnippetApi = (data) => snippetApi.create(data);
const getAllSnippetsApi = () => snippetApi.getAll();
const getSnippetByIdApi = (id) => snippetApi.getById(id);
const updateSnippetApi = (id, data) => snippetApi.update(id, data);
const deleteSnippetApi = (id) => snippetApi.delete(id);

const createSubscriptionApi = (data) => subscriptionApi.create(data);
const getAllSubscriptionsApi = () => subscriptionApi.getAll();
const getSubscriptionByIdApi = (id) => subscriptionApi.getById(id);
const updateSubscriptionApi = (id, data) => subscriptionApi.update(id, data);
const deleteSubscriptionApi = (id) => subscriptionApi.delete(id);

const createProjectAssetApi = (data) => projectAssetApi.create(data);
const getAllProjectAssetsApi = () => projectAssetApi.getAll();
const getProjectAssetByIdApi = (id) => projectAssetApi.getById(id);
const updateProjectAssetApi = (id, data) => projectAssetApi.update(id, data);
const deleteProjectAssetApi = (id) => projectAssetApi.delete(id);

const workspaceInviteApi = {
    invite: (data) =>
        axios.post("/api/workspace-invites/invite", data),

    getByWorkspace: (workspaceId) =>
        axios.get(`/api/workspace-invites/workspace/${workspaceId}`),

    getByToken: (token) =>
        axios.get(`/api/workspace-invites/invite/${token}`),

    accept: (token) =>
        axios.post("/api/workspace-invites/accept", {token}),

    cancel: (token) =>
        axios.delete(`/api/workspace-invites/${token}`),
};

const createWorkspaceInviteApi = (data) => workspaceInviteApi.create(data);
const getAllWorkspaceInvitesApi = () => workspaceInviteApi.getAll();
const getWorkspaceInviteByIdApi = (id) => workspaceInviteApi.getById(id);
const updateWorkspaceInviteApi = (id, data) => workspaceInviteApi.update(id, data);
const deleteWorkspaceInviteApi = (id) => workspaceInviteApi.delete(id);

const createWorkspaceMemberApi = (data) => workspaceMemberApi.create(data);
const getAllWorkspaceMembersApi = () => workspaceMemberApi.getAll();
const getWorkspaceMemberByIdApi = (id) => workspaceMemberApi.getById(id);
const updateWorkspaceMemberApi = (id, data) => workspaceMemberApi.update(id, data);
const deleteWorkspaceMemberApi = (id) => workspaceMemberApi.delete(id);

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
    getAllProjectAssetsApi,
    getProjectAssetByIdApi,
    updateProjectAssetApi,
    deleteProjectAssetApi,
    createWorkspaceInviteApi,
    getAllWorkspaceInvitesApi,
    getWorkspaceInviteByIdApi,
    updateWorkspaceInviteApi,
    deleteWorkspaceInviteApi,
    createWorkspaceMemberApi,
    getAllWorkspaceMembersApi,
    getWorkspaceMemberByIdApi,
    updateWorkspaceMemberApi,
    deleteWorkspaceMemberApi,
    refreshTokenApi,
    logoutApi,
    getAllAssetsApi,
    uploadAssetApi,
    getWorkspaceTagsApi,
    updateAssetApi,
    deleteAssetApi
};