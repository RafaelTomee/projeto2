import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_QUARTO_STATE = {
    numero: '',
    tipo: 'Solteiro', // Valor padrão
    
    capacidade: 1, // Valor padrão
    status: 'Disponível', // Valor padrão
};

/**
 * Componente de Formulário para Criação e Edição de Quartos.
 * @param {Object} props.quartoToEdit - Objeto quarto se estiver no modo Edição.
 * @param {Function} props.onSuccess - Callback para recarregar a lista após sucesso.
 */
function QuartoForm({ quartoToEdit = null, onSuccess }) {
    // Inicializa o estado com o objeto de edição ou o estado inicial
    const [formData, setFormData] = useState(INITIAL_QUARTO_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const { token, BASE_URL } = useAuth();

    // Sincroniza o estado do formulário quando o quartoToEdit muda
    useEffect(() => {
        if (quartoToEdit) {
            // Formata o valorDiaria para o estado do formulário (sempre como número)
            setFormData({
                ...quartoToEdit,
                valorDiaria: parseFloat(quartoToEdit.valorDiaria) || 0,
            });
        } else {
            setFormData(INITIAL_QUARTO_STATE);
        }
    }, [quartoToEdit]);

    // Manipulador de Mudança de Input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Manipulador de Submissão (POST ou PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        // Garante que o valorDiaria seja enviado como número, e não como string
        const dataToSend = {
            ...formData,
            valorDiaria: parseFloat(formData.valorDiaria),
            capacidade: parseInt(formData.capacidade),
        };

        const isEditing = !!quartoToEdit;
        const url = isEditing 
            ? `${BASE_URL}/quartos/${quartoToEdit.id}` 
            : `${BASE_URL}/quartos`;
        const method = isEditing ? 'PUT' : 'POST';

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
                throw new Error(data.message || `Falha ao ${isEditing ? 'editar' : 'cadastrar'} quarto.`);
            }

            setMessage(`Quarto ${isEditing ? 'editado' : 'cadastrado'} com sucesso!`);
            
            if (!isEditing) {
                setFormData(INITIAL_QUARTO_STATE); // Limpa o formulário
            }
            
            onSuccess(); // Recarrega a lista

        } catch (err) {
            setError(err.message || 'Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '30px', backgroundColor: '#d8ddef' }}>
            <h3>{quartoToEdit ? 'Editar Quarto' : 'Novo Quarto'}</h3>
            
            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="numero"
                    placeholder="Número do Quarto (ex: 101)"
                    value={formData.numero}
                    onChange={handleChange}
                    required
                />
                
                <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                    <option value="Solteiro">Solteiro</option>
                    <option value="Duplo">Duplo</option>
                    <option value="Casal">Casal</option>
                    <option value="Suite">Suíte</option>
                </select>

                <input
                    type="number"
                    name="capacidade"
                    placeholder="Capacidade (pessoas)"
                    value={formData.capacidade}
                    onChange={handleChange}
                    required
                    min="1"
                />
                
                <input
                    type="number"
                    name="valorDiaria"
                    placeholder="Valor Diária (R$)"
                    value={formData.valorDiaria || ''}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                />

                <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="Disponível">Disponível</option>
                    <option value="Ocupado">Ocupado</option>
                    <option value="Manutenção">Manutenção</option>
                </select>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Processando...' : quartoToEdit ? 'Salvar Edição' : 'Cadastrar Quarto'}
                </button>
                
                {quartoToEdit && (
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

export default QuartoForm;