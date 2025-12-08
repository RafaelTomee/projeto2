import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

/**
 * Componente de Rota Protegida.
 * Verifica a autenticação e, se falhar, redireciona para a página de Login.
 */
const PrivateRoute = ({ element: Component, ...rest }) => {
    // Pega o status de autenticação do contexto
    const { isAuthenticated } = useAuth(); 

    // Se estiver autenticado (true), renderiza o componente solicitado
    if (isAuthenticated) {
        return Component;
    }

    // Se NÃO estiver autenticado (false), redireciona para /login
    return <Navigate to="/login" replace />;
};

export default PrivateRoute;