// controllers/ReservaController.js
const { Reserva, Quarto, Cliente, sequelize } = require('../models');
const { Op } = require('sequelize');
const { parse, differenceInDays } = require('date-fns');

// --- Funções de Lógica de Negócio ---

// 1. Verifica se o quarto está disponível no período
const checkAvailability = async (quartoId, checkIn, checkOut, excludeReservaId = null) => {
  // As datas de entrada/saída são tratadas como DATEONLY no banco, 
  // mas o parse garante que as comparações sejam corretas, ignorando o tempo.
  const checkInDate = parse(checkIn, 'yyyy-MM-dd', new Date());
  const checkOutDate = parse(checkOut, 'yyyy-MM-dd', new Date());

  const queryOptions = {
    where: {
      quartoId: quartoId,
      status: { [Op.ne]: 'Cancelada' }, // Ignora reservas canceladas
      [Op.or]: [
        // Conflito: O período da nova reserva se sobrepõe a uma existente
        // A nova reserva começa antes do fim da existente E termina depois do começo da existente.
        { dataCheckIn: { [Op.lt]: checkOutDate }, dataCheckOut: { [Op.gt]: checkInDate } },
      ],
    },
  };

  if (excludeReservaId) {
    queryOptions.where.id = { [Op.ne]: excludeReservaId };
  }

  // Se houver conflito, o count será > 0
  const conflictingReservations = await Reserva.count(queryOptions);
  return conflictingReservations === 0;
};

// 2. Calcula o valor total e diárias
const calculateTotalValue = (checkIn, checkOut, valorDiaria) => {
    const checkInDate = parse(checkIn, 'yyyy-MM-dd', new Date());
    const checkOutDate = parse(checkOut, 'yyyy-MM-dd', new Date());
    
    // Calcula a diferença em dias (número de diárias)
    const totalDays = differenceInDays(checkOutDate, checkInDate);
    
    if (totalDays <= 0) {
        throw new Error("A data de check-out deve ser posterior à data de check-in.");
    }

    // valorDiaria é uma string, precisamos converter para float para o cálculo
    const valorTotal = totalDays * parseFloat(valorDiaria);
    
    return { 
        totalDiarias: totalDays, 
        valorTotal: valorTotal.toFixed(2) // Formata para 2 casas decimais
    };
};

// POST /api/reservas (CRIAR)
exports.create = async (req, res) => {
    const { clienteId, quartoId, dataCheckIn, dataCheckOut } = req.body;

    if (!dataCheckIn || !dataCheckOut || dataCheckIn >= dataCheckOut) {
        return res.status(400).send({ error: 'Datas de check-in/check-out inválidas. O check-out deve ser posterior ao check-in.' });
    }

    try {
        const quarto = await Quarto.findByPk(quartoId);
        const cliente = await Cliente.findByPk(clienteId);

        if (!quarto || !cliente) {
            return res.status(404).send({ error: 'Quarto ou Cliente não encontrado. Verifique os IDs.' });
        }

        // 3. Checar Disponibilidade (Verifica conflito com outras reservas)
        const isAvailable = await checkAvailability(quartoId, dataCheckIn, dataCheckOut);
        
        if (!isAvailable) {
            return res.status(409).send({ error: `O Quarto ${quarto.numero} não está disponível no período solicitado.` });
        }
        
        // Regra de Negócio: Quarto não pode ser reservado se estiver em Manutenção
        if (quarto.status === 'Manutenção') {
            return res.status(409).send({ error: `Quarto ${quarto.numero} está em Manutenção e não pode ser reservado.` });
        }

        // 4. Calcular Valor Total
        const { valorTotal, totalDiarias } = calculateTotalValue(dataCheckIn, dataCheckOut, quarto.valorDiaria);
        
        // 5. Criar Reserva
        const reserva = await Reserva.create({
            clienteId,
            quartoId,
            dataCheckIn,
            dataCheckOut,
            valorTotal,
            status: 'Confirmada',
        });

        // 6. Retornar a reserva criada com as informações associadas
        const newReserva = await Reserva.findByPk(reserva.id, {
            include: [{ model: Cliente, as: 'cliente' }, { model: Quarto, as: 'quarto' }]
        });
        
        // Nota: O status do Quarto só é atualizado para 'Ocupado' no momento do Check-In,
        // mas é checado pela função checkAvailability para garantir que não haja sobreposição.

        return res.status(201).send({ 
            message: `Reserva criada com sucesso! ${totalDiarias} diárias por R$ ${valorTotal}.`,
            reserva: newReserva 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message || 'Erro ao criar a reserva.' });
    }
};

// GET /api/reservas (LISTAR)
exports.list = async (req, res) => {
    try {
        const reservas = await Reserva.findAll({
            // Inclui Cliente e Quarto associados para ter detalhes completos
            include: [
                { model: Cliente, as: 'cliente', attributes: ['id', 'nome', 'cpf'] },
                { model: Quarto, as: 'quarto', attributes: ['id', 'numero', 'tipo', 'valorDiaria'] }
            ],
            // Exclui as chaves estrangeiras, mas não as informações associadas
            attributes: { exclude: ['createdAt', 'updatedAt', 'clienteId', 'quartoId'] } 
        });
        return res.send(reservas);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Erro ao buscar reservas.' });
    }
};

// DELETE /api/reservas/:id (REMOVER)
exports.remove = async (req, res) => {
    try {
        const deleted = await Reserva.destroy({
            where: { id: req.params.id }
        });

        if (deleted) {
            return res.status(204).send();
        }
        
        return res.status(404).send({ error: 'Reserva não encontrada.' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Erro ao deletar a reserva.' });
    }
};
// Funções de atualização (PUT / GETONE) devem ser implementadas se necessário
exports.getOne = async (req, res) => { return res.status(501).send({ error: 'Busca por ID de Reserva não implementada.' }); };
exports.update = async (req, res) => { return res.status(501).send({ error: 'Atualização de Reserva não implementada.' }); };