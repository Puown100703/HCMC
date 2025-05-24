import api from './api';

const getAllSubmittedForms = async () => {
    return api.get('/submitted-forms').then(response => response.data);
};

const getSubmittedFormById = async (id) => {
    return api.get(`/submitted-forms/${id}`).then(response => response.data);
};

const getMySubmittedForms = async () => {
    return api.get('/submitted-forms/my-submissions').then(response => response.data);
};

const getSubmittedFormsByDepartment = async (departmentId) => {
    return api.get(`/submitted-forms/department/${departmentId}`).then(response => response.data);
};

const createSubmittedForm = async (submittedFormData) => {
    return api.post('/submitted-forms', submittedFormData).then(response => response.data);
};

const updateSubmittedForm = async (id, submittedFormData) => {
    return api.put(`/submitted-forms/${id}`, submittedFormData).then(response => response.data);
};

const deleteSubmittedForm = async (id) => {
    return api.delete(`/submitted-forms/${id}`).then(response => response.data);
};

const getSubmittedFormsByStudent = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        throw new Error('User not found or missing ID');
    }
    return api.get(`/submitted-forms/student/${user.id}`).then(response => response.data);
};

const submittedFormService = {
    getAllSubmittedForms,
    getSubmittedFormById,
    getMySubmittedForms,
    getSubmittedFormsByDepartment,
    createSubmittedForm,
    updateSubmittedForm,
    deleteSubmittedForm,
    getSubmittedFormsByStudent
};

export default submittedFormService;