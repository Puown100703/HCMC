import api from './api';

const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Add redirect path based on user role
        return {
            ...response.data,
            redirectTo: getRedirectPathByRole(response.data.user.role)
        };
    }
    return response.data;
};

// Helper function to determine redirect path based on user role
const getRedirectPathByRole = (role) => {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'staff':
            return '/staff';
        case 'student':
            return '/home';
        default:
            return '/dashboard';
    }
};

const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

const getProfile = async () => {
    return api.get('/auth/profile').then(response => response.data);
};

const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

const hasRole = (requiredRoles) => {
    const user = getCurrentUser();
    if (!user) return false;
    return requiredRoles.includes(user.role);
};

const authService = {
    login,
    register,
    logout,
    getCurrentUser,
    getProfile,
    isAuthenticated,
    hasRole
};

export default authService;