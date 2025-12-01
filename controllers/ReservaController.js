// controllers/ReservaController.js
const { Reserva, Quarto, Cliente, sequelize } = require('../models');
const { Op } = require('sequelize');
const { parse, differenceInDays } = require('date-fns');

// --- Funções de Lógica de Negócio ---

// 1. Verifica se o quarto está disponível no período
const checkAvailability = async (quartoId, checkIn, checkOut, excludeReservaId = null) => {
  const queryOptions = {
    where: {
      quartoId: quartoId,
      status: { [Op.ne]: 'Cancelada' }, // Ignora reservas canceladas
      [Op.or]: [
        // Nova reserva começa durante uma existente
        { dataCheckIn: { [Op.lt]: checkOut }, dataCheckOut: { [Op.gt]: checkIn } },
        // Nova reserva engloba uma existente
        { dataCheckIn: { [Op.gte]: checkIn, [Op.lt]: checkOut } },
        // Nova reserva está contida em uma existente
        { dataCheckOut: { [Op.lt]: checkOut, [Op.gt]: checkIn } },
      ],
    },
  };

  if (excludeReservaId) {
    queryOptions.where.id = { [Op.ne]: excludeReservaId };
  }

  const conflictingReservations = await Reserva.count(queryOptions);
  return conflictingReservations === 0;
};

// 2. Calcula o valor total e diárias
const calculateTotalValue = (checkInDate, checkOutDate, valorDiaria) => {
  const startDate = parse(checkInDate, 'yyyy-MM-dd', new Date());
  const endDate = parse(checkOutDate, 'yyyy-MM-dd', new Date());

  // differenceInDays retorna a diferença, se for 1 dia (checkin 01/01, checkout 02/01), o resultado é 1 diária.
  const days = differenceInDays(endDate, startDate);

  if (days <= 0) {
    throw new Error('A data de Check-Out deve ser posterior à data de Check-In.');
  }

  const valorTotal = days * parseFloat(valorDiaria);
  return { days, valorTotal: valorTotal.toFixed(2) };
};

// --- Funções CRUD ---

// POST /api/reservas
exports.create = async (req, res) => {
  const { clienteId, quartoId, dataCheckIn, dataCheckOut } = req.body;

  try {
    if (dataCheckIn >= dataCheckOut) {
      return res.status(400).send({ error: 'Data de Check-Out deve ser posterior à de Check-In.' });
    }

    const quarto = await Quarto.findByPk(quartoId);
    if (!quarto) {
      return res.status(404).send({ error: 'Quarto não encontrado.' });
    }
    
    // 1. Verificar Disponibilidade
    const isAvailable = await checkAvailability(quartoId, dataCheckIn, dataCheckOut);
    if (!isAvailable) {
      return res.status(409).send({ error: 'O quarto está ocupado neste período.' });
    }
    
    // 2. Calcular Valor Total
    const { valorTotal } = calculateTotalValue(dataCheckIn, dataCheckOut, quarto.valorDiaria);

    // 3. Criar Reserva
    const reserva = await Reserva.create({
      clienteId,
      quartoId,
      dataCheckIn,
      dataCheckOut,
      valorTotal,
      status: 'Confirmada',
    });

    // NOVO: 4. Atualizar o status do Quarto para 'Ocupado'
    // await Quarto.update(
    //     { status: 'Ocupado' }, 
    //     { where: { id: quartoId } }
    // );

    return res.status(201).send(reserva);
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: error.message || 'Erro ao criar reserva.' });
  }
};

// GET /api/reservas
exports.list = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome', 'cpf'] },
        { model: Quarto, as: 'quarto', attributes: ['id', 'numero', 'tipo', 'valorDiaria'] }
      ]
    });
    return res.send(reservas);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao buscar reservas.' });
  }
};

// NOVO: GET /api/reservas/:id (Adicionado para corrigir o erro da rota)
exports.getOne = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome', 'cpf'] },
        { model: Quarto, as: 'quarto', attributes: ['id', 'numero', 'tipo', 'valorDiaria'] }
      ]
    });

    if (!reserva) {
      return res.status(404).send({ error: 'Reserva não encontrada.' });
    }

    return res.send(reserva);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao buscar a reserva.' });
  }
};

// PUT /api/reservas/:id
exports.update = async (req, res) => {
  const reservaId = req.params.id;
  const { clienteId, quartoId, dataCheckIn, dataCheckOut, status } = req.body;

  try {
    const existingReserva = await Reserva.findByPk(reservaId);
    if (!existingReserva) {
      return res.status(404).send({ error: 'Reserva não encontrada.' });
    }

    const quarto = await Quarto.findByPk(quartoId || existingReserva.quartoId);
    if (!quarto) {
        return res.status(404).send({ error: 'Quarto não encontrado.' });
    }

    // 1. Verificar Disponibilidade apenas se datas ou quarto mudarem
    const newCheckIn = dataCheckIn || existingReserva.dataCheckIn;
    const newCheckOut = dataCheckOut || existingReserva.dataCheckOut;
    const newQuartoId = quartoId || existingReserva.quartoId;
    
    if (newCheckIn >= newCheckOut) {
      return res.status(400).send({ error: 'Data de Check-Out deve ser posterior à de Check-In.' });
    }
    
    const isAvailable = await checkAvailability(newQuartoId, newCheckIn, newCheckOut, reservaId);
    if (!isAvailable) {
      return res.status(409).send({ error: 'O quarto está ocupado neste novo período.' });
    }

    // 2. Recalcular Valor Total (se datas ou quarto mudaram)
    const { valorTotal } = calculateTotalValue(newCheckIn, newCheckOut, quarto.valorDiaria);
    
    // 3. Atualizar Reserva
    const [updated] = await Reserva.update({
        clienteId: clienteId || existingReserva.clienteId,
        quartoId: newQuartoId,
        dataCheckIn: newCheckIn,
        dataCheckOut: newCheckOut,
        status: status || existingReserva.status,
        valorTotal: valorTotal
    }, {
      where: { id: reservaId }
    });

    if (updated) {
      const updatedReserva = await Reserva.findByPk(reservaId, {
        include: [{ model: Cliente, as: 'cliente' }, { model: Quarto, as: 'quarto' }]
      });

      // NOVO: Lógica de atualização de status do Quarto
      if (updatedReserva.status === 'Cancelada' || updatedReserva.status === 'Check-Out') {
          // Verifica se há outras reservas ativas (Confirmada ou Check-In) para este quarto
          const hasActiveReservations = await Reserva.count({
              where: {
                  quartoId: updatedReserva.quartoId,
                  id: { [Op.ne]: reservaId }, // Exclui a reserva que acabou de ser cancelada/finalizada
                  status: { [Op.in]: ['Confirmada', 'Check-In'] }
              }
          });

          if (hasActiveReservations === 0) {
              // Se não houver outras reservas ativas, o quarto volta a ficar Disponível
              await Quarto.update(
                  { status: 'Disponível' },
                  { where: { id: updatedReserva.quartoId } }
              );
          }
      } else if (updatedReserva.status === 'Check-In' || updatedReserva.status === 'Confirmada') {
          // Se a reserva foi atualizada para Confirmada ou Check-In (e o status foi modificado para outro valor), 
          // garantimos que o quarto está como Ocupado.
           await Quarto.update(
              { status: 'Ocupado' },
              { where: { id: updatedReserva.quartoId } }
          );
      }
      
      return res.status(200).send(updatedReserva);
    }
    
    return res.status(500).send({ error: 'Falha na atualização da reserva.' });

  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: error.message || 'Erro ao atualizar reserva.' });
  }
};

// DELETE /api/reservas/:id
exports.remove = async (req, res) => {
  try {
    const reservaId = req.params.id;
    const existingReserva = await Reserva.findByPk(reservaId);

    const deleted = await Reserva.destroy({
      where: { id: reservaId }
    });

    if (deleted && existingReserva) {
        // NOVO: Lógica após exclusão para liberar o quarto
        // Verifica se há outras reservas ativas (Confirmada ou Check-In) para este quarto
        const hasActiveReservations = await Reserva.count({
            where: {
                quartoId: existingReserva.quartoId,
                status: { [Op.in]: ['Confirmada', 'Check-In'] }
            }
        });

        if (hasActiveReservations === 0) {
            // Se não houver outras reservas ativas, o quarto volta a ficar Disponível
            await Quarto.update(
                { status: 'Disponível' },
                { where: { id: existingReserva.quartoId } }
            );
        }

      return res.status(204).send();
    }
    
    return res.status(404).send({ error: 'Reserva não encontrada.' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao deletar a reserva.' });
  }
};