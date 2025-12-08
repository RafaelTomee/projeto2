import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 


const PrivateRoute = ({ element: Component, ...rest }) => {
    const { isAuthenticated } = useAuth(); 

    if (isAuthenticated) {
        return Component;
    }
    return <Navigate to="/login" replace />;
};

export default PrivateRoute;