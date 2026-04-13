import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [viewRole, setViewRole] = useState(null); // New state for effective role view
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.baseURL = '/api/v1';
    axios.defaults.withCredentials = true;

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/auth/me');
            setUser(data.user);
            setViewRole(data.user.role); // Default view role is actual role
        } catch (error) {
            setUser(null);
            setViewRole(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password });
        setUser(data.user);
        setViewRole(data.user.role);
        return data.user;
    };

    const logout = async () => {
        await axios.post('/auth/logout');
        setUser(null);
        setViewRole(null);
    };

    const switchViewRole = (role) => {
        setViewRole(role);
    };

    return (
        <AuthContext.Provider value={{ user, viewRole, switchViewRole, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
