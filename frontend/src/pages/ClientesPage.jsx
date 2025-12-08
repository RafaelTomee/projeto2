import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import ClienteForm from '../components/crud/ClienteForm'; // <-- NOVO: Importa o formulário

function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null); // Mensagem de exclusão
    
    // Estado para controle de EDIÇÃO
    const [clienteSelecionado, setClienteSelecionado] = useState(null); 

    const { token, BASE_URL } = useAuth();

    // 1. Função de Listagem (Listagem (Read) mantida)
    const fetchClientes = async () => {
        setLoading(true);
        setError(null);
        setClienteSelecionado(null); // Limpa seleção ao recarregar a lista

        // ... (lógica de fetchClientes aqui, igual à anterior) ...
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
    
    // 2. Função de Exclusão (Delete)
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
            
            // Recarrega a lista após exclusão
            fetchClientes(); 

        } catch (err) {
            setDeleteMessage(err.message || 'Erro ao tentar excluir.');
        }
    };


    // Roda a função de busca na montagem do componente
    useEffect(() => {
        if (token) {
            fetchClientes();
        }
    }, [token]); 

    // Função de sucesso para ser passada ao ClienteForm
    const handleFormSuccess = (clienteParaLimpar = null) => {
        // Limpa a seleção e recarrega a lista (o form fará a mensagem de sucesso)
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