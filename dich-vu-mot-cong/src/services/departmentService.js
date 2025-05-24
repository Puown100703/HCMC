import api from './api';

const getAllDepartments = async () => {
    return api.get('/departments').then(response => response.data);
};

const getDepartmentById = async (id) => {
    return api.get(`/departments/${id}`).then(response => response.data);
};

const createDepartment = async (departmentData) => {
    return api.post('/departments', departmentData).then(response => response.data);
};

const updateDepartment = async (id, departmentData) => {
    return api.put(`/departments/${id}`, departmentData).then(response => response.data);
};

const deleteDepartment = async (id) => {
    return api.delete(`/departments/${id}`).then(response => response.data);
};

const departmentService = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};

export default departmentService; 