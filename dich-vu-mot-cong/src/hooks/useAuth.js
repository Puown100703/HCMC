import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from local storage on mount
        const loadUser = () => {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = useCallback(async (username, password) => {
        try {
            setLoading(true);
            const data = await authService.login(username, password);
            setUser(data.user);
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            setLoading(true);
            const data = await authService.register(userData);
            setUser(data.user);
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const isAuthenticated = useCallback(() => {
        return authService.isAuthenticated();
    }, []);

    const hasRole = useCallback((requiredRoles) => {
        return authService.hasRole(requiredRoles);
    }, []);

    return {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole
    };
};

export default useAuth; 