import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ReservaForm from '../components/crud/ReservaForm'; // <-- NOVO: Importa o formulário

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
};

function ReservasPage() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null);

    // Estado para controle de EDIÇÃO
    const [reservaSelecionada, setReservaSelecionada] = useState(null);

    const { token, BASE_URL } = useAuth();

    // 1. Função de Listagem (Read)
    const fetchReservas = async () => {
        setLoading(true);
        setError(null);
        setReservaSelecionada(null); // Limpa seleção

        try {
            const response = await fetch(`${BASE_URL}/reservas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Falha ao listar reservas.");
            setReservas(data);
        } catch (err) {
            setError(err.message || "Erro de conexão ao buscar reservas.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Função de Exclusão (Delete)
    const handleDeleteReserva = async (reservaId) => {
        if (!window.confirm(`Tem certeza que deseja cancelar a reserva ${reservaId}?`)) return;

        setDeleteMessage(null);

        try {
            const response = await fetch(`${BASE_URL}/reservas/${reservaId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Falha ao cancelar reserva ${reservaId}.`);
            }

            setDeleteMessage(`Reserva ID ${reservaId} cancelada com sucesso!`);
            fetchReservas(); // Recarrega a lista

        } catch (err) {
            setDeleteMessage(err.message || 'Erro ao tentar cancelar reserva.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchReservas();
        }
    }, [token]);

    // Função de sucesso para ser passada ao ReservaForm
    const handleFormSuccess = (reservaParaLimpar = null) => {
        setReservaSelecionada(reservaParaLimpar);
        fetchReservas();
    };

    return (
        <div className="page-content">
            <h2>Gerenciar Reservas</h2>

            {/* Renderiza o Formulário de Reserva (Cadastro ou Edição) */}
            <ReservaForm
                reservaToEdit={reservaSelecionada}
                onSuccess={handleFormSuccess}
            />

            {deleteMessage && <div className="error-box" style={{ backgroundColor: '#f8d7da', marginBottom: '15px' }}>{deleteMessage}</div>}

            {loading && <p>Carregando lista de reservas...</p>}
            {error && <div className="error-box">{error}</div>}

            {/* Tabela de Listagem */}
            {(!loading && !error) && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Lista de Reservas ({reservas.length})</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Quarto N°</th>
                                <th>Cliente</th>
                                <th>Total (R$)</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservas.map((reserva) => (
                                <tr key={reserva.id}>
                                    <td>{reserva.id}</td>
                                    <td>{formatDate(reserva.dataCheckIn)}</td>
                                    <td>{formatDate(reserva.dataCheckOut)}</td>
                                    {/* Nota: Na sua API, idealmente você retornaria o nome/número e não apenas o ID */}
                                    <td>{reserva.quartoId}</td>
                                    <td>{reserva.clienteId}</td>
                                    <td>
                                        R$ {
                                            reserva.valorTotal
                                                ? parseFloat(reserva.valorTotal).toFixed(2) // Garante que é um número antes de toFixed
                                                : '0.00' // Use '0.00' em vez de 'N/A' para valores monetários
                                        }
                                    </td>
                                    <td>
                                        {/* Botão de Edição */}
                                        <button
                                            onClick={() => setReservaSelecionada(reserva)}
                                            className="small-button"
                                        >
                                            Editar
                                        </button>

                                        {/* Botão de Exclusão/Cancelar */}
                                        <button
                                            onClick={() => handleDeleteReserva(reserva.id)}
                                            className="small-button delete-button"
                                            style={{ backgroundColor: '#dc3545', marginLeft: '5px' }}
                                        >
                                            Cancelar
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

export default ReservasPage;