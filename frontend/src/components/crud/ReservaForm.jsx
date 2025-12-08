import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_RESERVA_STATE = {
    clienteId: '',
    quartoId: '',
    dataCheckIn: '',
    dataCheckOut: '',
    // Valor total e status são geralmente calculados ou definidos pelo backend
};

/**
 * Componente de Formulário para Criação e Edição de Reservas.
 */
function ReservaForm({ reservaToEdit = null, onSuccess }) {
    const [formData, setFormData] = useState(INITIAL_RESERVA_STATE);
    const [clientes, setClientes] = useState([]); // Lista para o dropdown
    const [quartos, setQuartos] = useState([]);   // Lista para o dropdown

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true); // Carregamento inicial dos dados
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const { token, BASE_URL } = useAuth();

    // -----------------------------------------------------------
    // CARREGAMENTO DE DADOS EXTRAS (CLIENTES E QUARTOS)
    // -----------------------------------------------------------
    useEffect(() => {
        const fetchDependencies = async () => {
            if (!token) return;
            setDataLoading(true);

            // Busca Clientes e Quartos em paralelo
            try {
                const [clientesRes, quartosRes] = await Promise.all([
                    fetch(`${BASE_URL}/clientes`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${BASE_URL}/quartos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                ]);

                const clientesData = await clientesRes.json();
                const quartosData = await quartosRes.json();

                if (clientesRes.ok) setClientes(clientesData);
                if (quartosRes.ok) setQuartos(quartosData);
            } catch (err) {
                setError("Erro ao carregar clientes/quartos para o formulário.");
            } finally {
                setDataLoading(false);
            }
        };

        fetchDependencies();
    }, [token]);


    // -----------------------------------------------------------
    // MODO EDIÇÃO (Sincroniza dados da reserva)
    // -----------------------------------------------------------
    useEffect(() => {
        if (reservaToEdit) {
            // As datas vêm no formato ISO da API, precisamos do formato YYYY-MM-DD para o input type="date"
            setFormData({
                ...reservaToEdit,
                dataCheckIn: reservaToEdit.dataCheckIn ? reservaToEdit.dataCheckIn.split('T')[0] : '',
                dataCheckOut: reservaToEdit.dataCheckOut ? reservaToEdit.dataCheckOut.split('T')[0] : '',
            });
        } else {
            setFormData(INITIAL_RESERVA_STATE);
        }
    }, [reservaToEdit]);


    // -----------------------------------------------------------
    // LÓGICA DO FORMULÁRIO
    // -----------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            // Converte IDs para números inteiros antes de salvar no estado
            [name]: (name === 'clienteId' || name === 'quartoId') ? parseInt(value) : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const isEditing = !!reservaToEdit;
        const url = isEditing
            ? `${BASE_URL}/reservas/${reservaToEdit.id}`
            : `${BASE_URL}/reservas`;
        const method = isEditing ? 'PUT' : 'POST';

        // Garante que os IDs sejam enviados como números
        const dataToSend = {
            ...formData,
            clienteId: parseInt(formData.clienteId),
            quartoId: parseInt(formData.quartoId),
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Falha ao ${isEditing ? 'editar' : 'criar'} reserva.`);
            }

            setMessage(`Reserva ${isEditing ? 'editada' : 'criada'} com sucesso!`);
            if (!isEditing) setFormData(INITIAL_RESERVA_STATE);

            onSuccess();

        } catch (err) {
            setError(err.message || 'Erro ao processar reserva.');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return <p>Carregando dados para o formulário de reserva...</p>;
    }


    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '30px', backgroundColor: '#d8ddef' }}>
            <h3>{reservaToEdit ? 'Editar Reserva' : 'Nova Reserva'}</h3>

            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <form onSubmit={handleSubmit}>

                {/* 1. SELEÇÃO DO CLIENTE */}
                <select name="clienteId" value={formData.clienteId} onChange={handleChange} required>
                    <option value="">-- Selecione o Cliente --</option>
                    {clientes.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.nome} ({c.cpf})
                        </option>
                    ))}
                </select>

                {/* 2. SELEÇÃO DO QUARTO */}
                <select name="quartoId" value={formData.quartoId} onChange={handleChange} required>
                    <option value="">-- Selecione o Quarto --</option>
                    {quartos.map(q => (
                        <option key={q.id} value={q.id}>
                            Nº {q.numero} - {q.tipo} (R$ {q.valorDiaria
                                ? parseFloat(q.valorDiaria).toFixed(2) // CORREÇÃO AQUI
                                : '0.00'})
                        </option>
                    ))}
                </select>

                {/* 3. DATAS */}
                <label>Check-in:</label>
                <input
                    type="date"
                    name="dataCheckIn"
                    value={formData.dataCheckIn}
                    onChange={handleChange}
                    required
                />
                <label>Check-out:</label>
                <input
                    type="date"
                    name="dataCheckOut"
                    value={formData.dataCheckOut}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading || dataLoading || !formData.clienteId || !formData.quartoId}>
                    {loading ? 'Processando...' : reservaToEdit ? 'Salvar Edição' : 'Criar Reserva'}
                </button>

                {reservaToEdit && (
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

export default ReservaForm;