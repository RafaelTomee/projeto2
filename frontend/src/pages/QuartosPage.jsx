import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import QuartoForm from '../components/crud/QuartoForm';

function QuartosPage() {
    const [quartos, setQuartos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null);
    
    const [quartoSelecionado, setQuartoSelecionado] = useState(null); 

    const { token, BASE_URL } = useAuth();

    const fetchQuartos = async () => {
        setLoading(true);
        setError(null);
        setQuartoSelecionado(null); 

        try {
            const response = await fetch(`${BASE_URL}/quartos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Falha ao listar quartos.");
            setQuartos(data); 
        } catch (err) {
            setError(err.message || "Erro de conexão ao buscar quartos.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteQuarto = async (quartoId) => {
        if (!window.confirm(`Tem certeza que deseja excluir o quarto ${quartoId}? Esta ação é irreversível.`)) return;

        setDeleteMessage(null);
        
        try {
            const response = await fetch(`${BASE_URL}/quartos/${quartoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Falha ao excluir quarto ${quartoId}.`);
            }

            setDeleteMessage(`Quarto ID ${quartoId} excluído com sucesso!`);
            fetchQuartos(); 

        } catch (err) {
            setDeleteMessage(err.message || 'Erro ao tentar excluir.');
        }
    };
    useEffect(() => {
        if (token) {
            fetchQuartos();
        }
    }, [token]); 

    const handleFormSuccess = (quartoParaLimpar = null) => {
        setQuartoSelecionado(quartoParaLimpar); 
        fetchQuartos();
    };

    return (
        <div className="page-content">
            <h2>Gerenciar Quartos</h2>
            
            {/* Renderiza o Formulário de Quarto (Cadastro ou Edição) */}
            <QuartoForm 
                quartoToEdit={quartoSelecionado} 
                onSuccess={handleFormSuccess} 
            />

            {deleteMessage && <div className="error-box" style={{ backgroundColor: '#f8d7da', marginBottom: '15px' }}>{deleteMessage}</div>}
            
            {loading && <p>Carregando lista de quartos...</p>}
            {error && <div className="error-box">{error}</div>}
            
            {/* Tabela de Listagem */}
            {(!loading && !error) && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Lista de Quartos ({quartos.length})</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Número</th>
                                <th>Tipo</th>
                                <th>Valor Diária</th>
                                <th>Capacidade</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quartos.map((quarto) => (
                                <tr key={quarto.id}>
                                    <td>{quarto.id}</td>
                                    <td>{quarto.numero}</td>
                                    <td>{quarto.tipo}</td>
                                    
                                    <td>{quarto.capacidade}</td>
                                    <td>{quarto.status}</td>
                                    <td>
                                        {/* Botão de Edição */}
                                        <button 
                                            onClick={() => setQuartoSelecionado(quarto)}
                                            className="small-button"
                                        >
                                            Editar
                                        </button>
                                        
                                        {/* Botão de Exclusão */}
                                        <button 
                                            onClick={() => handleDeleteQuarto(quarto.id)}
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

export default QuartosPage;