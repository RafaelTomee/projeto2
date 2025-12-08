import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import ClienteForm from '../components/crud/ClienteForm'; 

function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null); 
    const [clienteSelecionado, setClienteSelecionado] = useState(null); 

    const { token, BASE_URL } = useAuth();

    const fetchClientes = async () => {
        setLoading(true);
        setError(null);
        setClienteSelecionado(null); 
        try {
            const response = await fetch(`${BASE_URL}/clientes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Falha ao listar clientes.");
            setClientes(data); 
        } catch (err) {
            setError(err.message || "Erro de conexão ao buscar clientes.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteCliente = async (clienteId) => {
        if (!window.confirm(`Tem certeza que deseja excluir o cliente com ID ${clienteId}?`)) return;

        setDeleteMessage(null);
        
        try {
            const response = await fetch(`${BASE_URL}/clientes/${clienteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Falha ao excluir cliente ${clienteId}.`);
            }

            setDeleteMessage(`Cliente ID ${clienteId} excluído com sucesso!`);
            
            fetchClientes(); 

        } catch (err) {
            setDeleteMessage(err.message || 'Erro ao tentar excluir.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchClientes();
        }
    }, [token]); 

    const handleFormSuccess = (clienteParaLimpar = null) => {
        setClienteSelecionado(clienteParaLimpar); 
        fetchClientes();
    };

    return (
        <div className="page-content">
            <h2>Gerenciar Clientes</h2>
            
            {/* 3. Renderiza o Formulário de Cliente (Cadastro ou Edição) */}
            <ClienteForm 
                clienteToEdit={clienteSelecionado} 
                onSuccess={handleFormSuccess} 
            />

            {deleteMessage && <div className="error-box" style={{ backgroundColor: '#f8d7da', marginBottom: '15px' }}>{deleteMessage}</div>}
            
            {loading && <p>Carregando lista de clientes...</p>}
            {error && <div className="error-box">{error}</div>}
            
            {/* Tabela de Listagem */}
            {(!loading && !error) && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Lista de Clientes ({clientes.length})</h3>
                    {/* ... (tabela cabeçalho) ... */}
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>{cliente.id}</td>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.cpf}</td>
                                    <td>{cliente.telefone}</td>
                                    <td>{cliente.email}</td>
                                    <td>
                                        {/* Botão de Edição (Define o clienteSelecionado no estado) */}
                                        <button 
                                            onClick={() => setClienteSelecionado(cliente)}
                                            className="small-button"
                                        >
                                            Editar
                                        </button>
                                        
                                        {/* Botão de Exclusão */}
                                        <button 
                                            onClick={() => handleDeleteCliente(cliente.id)}
                                            className="small-button delete-button"
                                            style={{ backgroundColor: '#dc3545', marginLeft: '5px' }}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ClientesPage;