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
const URL_API = "/api/auth/register";
const data = {
name, email, password

}

return axios.post(URL_API, data)

}

const loginApi = (email, password) => {
const URL_API = "/api/auth/login";
const data = {
email, password
}
return axios.post(URL_API, data)

}

const getUserApi = () => {
const URL_API = "/api/auth/user/profile";
return axios.get (URL_API)

}

export {
createUserApi, loginApi, getUserApi}