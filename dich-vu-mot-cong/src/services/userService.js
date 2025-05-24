import api from './api';

const getAllUsers = async () => {
    return api.get('/users').then(response => response.data);
};

const getUserById = async (id) => {
    return api.get(`/users/${id}`).then(response => response.data);
};

const createUser = async (userData) => {
    return api.post('/users', userData).then(response => response.data);
};

const updateUser = async (id, userData) => {
    return api.put(`/users/${id}`, userData).then(response => response.data);
};

const deleteUser = async (id) => {
    return api.delete(`/users/${id}`).then(response => response.data);
};

const getUsersByDepartment = async (departmentId) => {
    return api.get(`/users/department/${departmentId}`).then(response => response.data);
};

const userService = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByDepartment
};

export default userService; 