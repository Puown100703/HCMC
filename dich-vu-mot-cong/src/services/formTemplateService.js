import api from './api';

const getAllFormTemplates = async () => {
    return api.get('/form-templates').then(response => response.data);
};

const getFormTemplateById = async (id) => {
    return api.get(`/form-templates/${id}`).then(response => response.data);
};

const getFormTemplatesByDepartment = async (departmentId) => {
    return api.get(`/form-templates/department/${departmentId}`).then(response => response.data);
};

const createFormTemplate = async (formData) => {
    return api.post('/form-templates', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => response.data);
};

const updateFormTemplate = async (id, formData) => {
    return api.put(`/form-templates/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => response.data);
};

const deleteFormTemplate = async (id) => {
    return api.delete(`/form-templates/${id}`).then(response => response.data);
};

const formTemplateService = {
    getAllFormTemplates,
    getFormTemplateById,
    getFormTemplatesByDepartment,
    createFormTemplate,
    updateFormTemplate,
    deleteFormTemplate
};

export default formTemplateService;