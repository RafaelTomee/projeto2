import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('jwtToken') || null);
    const [role, setRole] = useState(localStorage.getItem('userRole') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    const BASE_URL = "http://localhost:3000/api"; 

    useEffect(() => {
        setIsAuthenticated(!!token);
        if (token) {
            localStorage.setItem('jwtToken', token);
            localStorage.setItem('userRole', role);
        } else {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userRole');
        }
    }, [token, role]);

    const login = (jwtToken, userRole) => {
        setToken(jwtToken);
        setRole(userRole);
    };

    const logout = () => {
        setToken(null);
        setRole(null);
    };

    const contextValue = {
        token,
        role,
        isAuthenticated,
        login,
        logout,
        BASE_URL
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};