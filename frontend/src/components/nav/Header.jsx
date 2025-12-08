import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
    // Pega o estado e a função do contexto
    const { isAuthenticated, role, logout } = useAuth(); 

    // O useNavigate seria necessário aqui, mas vamos usar a função direta por enquanto

    // Estilos inline básicos para simular o visual de cabeçalho
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: '#1F271B', // Deep Green (da sua paleta)
        color: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
    };
    
    // Estilo para links ativos (o NavLink adiciona a classe active, mas usaremos estilo inline)
    const activeLinkStyle = {
        fontWeight: 'bold',
        color: '#F4D35E', // Gold/Accent
        textDecoration: 'underline'
    };
    
    // Estilo padrão para links
    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
        margin: '0 15px'
    };

    return (
        <header style={headerStyle}>
            <Link to="/" style={{ color: '#7A9E7E', fontSize: '24px', fontWeight: 'bold' }}>
                Hotel
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center' }}>
                {isAuthenticated ? (
                    <>
                        {/* Links de Navegação (Apenas visíveis se logado) */}
                        <NavLink 
                            to="/clientes" 
                            style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}
                        >
                            Clientes
                        </NavLink>
                        
                        <NavLink 
                            to="/quartos" 
                            style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}
                        >
                            Quartos
                        </NavLink>
                         
                         <NavLink 
                            to="/reservas" 
                            style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}
                        >
                            Reservas
                        </NavLink>
                        
                        {/* Status e Logout */}
                        <span style={{ margin: '0 20px', color: '#7A9E7E' }}>
                            | Perfil: {role || 'Não definido'}
                        </span>

                        <button 
                            onClick={logout} 
                            style={{ 
                                padding: '8px 12px', 
                                backgroundColor: '#dc3545', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer' 
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    // Se não estiver autenticado, mostra apenas o link de Login
                    <NavLink 
                        to="/login" 
                        style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}
                    >
                        Login
                    </NavLink>
                )}
            </nav>
        </header>
    );
}

export default Header;