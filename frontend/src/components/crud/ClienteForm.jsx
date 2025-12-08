import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_CLIENTE_STATE = {
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
};

function ClienteForm({ clienteToEdit = null, onSuccess }) {
    const [formData, setFormData] = useState(INITIAL_CLIENTE_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const { token, BASE_URL } = useAuth();

    useEffect(() => {
        if (clienteToEdit) {
            setFormData(clienteToEdit);
        } else {
            setFormData(INITIAL_CLIENTE_STATE);
        }
    }, [clienteToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const isEditing = !!clienteToEdit;
        const url = isEditing 
            ? `${BASE_URL}/clientes/${clienteToEdit.id}` 
            : `${BASE_URL}/clientes`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Falha ao ${isEditing ? 'editar' : 'cadastrar'} cliente.`);
            }

            setMessage(`Cliente ${isEditing ? 'editado' : 'cadastrado'} com sucesso!`);
            
            if (!isEditing) {
                setFormData(INITIAL_CLIENTE_STATE);
            }
            
            onSuccess(); 

        } catch (err) {
            setError(err.message || 'Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '30px', backgroundColor: '#d8ddef' }}>
            <h3>{clienteToEdit ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            
            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="nome"
                    placeholder="Nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="cpf"
                    placeholder="CPF (apenas números)"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="telefone"
                    placeholder="Telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Processando...' : clienteToEdit ? 'Salvar Edição' : 'Cadastrar Cliente'}
                </button>
                
                {clienteToEdit && (
                    <button 
                        type="button" 
                        onClick={() => onSuccess(null)} 
                        style={{ marginLeft: '10px', backgroundColor: '#587291' }}
                    >
                        Cancelar
                    </button>
                )}
            </form>
        </div>
    );
}

export default ClienteForm;