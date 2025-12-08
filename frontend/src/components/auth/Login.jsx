import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx'; // Volta duas pastas para 'context'

function Login() {
    const { login, BASE_URL } = useAuth(); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Falha no login. Credenciais inválidas.");
            }
            
            // Assume que a API retorna o token e, opcionalmente, o perfil
            const userRole = data.user && data.user.role ? data.user.role : 'recepcionista';
            login(data.token, userRole);
            
            setSuccessMessage("Login bem-sucedido! Redirecionando...");
            // O sistema de rotas (App.jsx) cuidará do redirecionamento após o login
            
        } catch (err) {
            setError(err.message || "Erro desconhecido ao tentar logar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Login</h2>
            
            {error && <div className="error-box" style={{ color: 'red' }}>{error}</div>}
            {successMessage && <div className="success-box" style={{ color: 'green' }}>{successMessage}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default Login;