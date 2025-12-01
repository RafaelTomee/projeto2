// controllers/QuartoController.js
const { Quarto, Reserva, sequelize } = require('../models'); 
const { Op } = require('sequelize');                             
const { format } = require('date-fns');                      

// Função para verificar o status dinâmico do quarto para a data de hoje
const getDynamicStatus = async (quartoId) => {
  // Pega a data de hoje no formato 'yyyy-MM-dd' para comparação no banco de dados
  const today = format(new Date(), 'yyyy-MM-dd');

  // 1. Verifica se há uma reserva ATIVA para hoje
  const activeReservation = await Reserva.findOne({
    where: {
      quartoId: quartoId,
      // Considera 'Confirmada' e 'Check-In' como reservas ativas
      status: { [Op.in]: ['Confirmada', 'Check-In'] },
      // O quarto está ocupado hoje se:
      // dataCheckIn for hoje ou uma data passada (<= today)
      dataCheckIn: { [Op.lte]: today }, 
      // E dataCheckOut for amanhã ou uma data futura (> today)
      dataCheckOut: { [Op.gt]: today }, 
    }
  });

  // 2. Verifica se o quarto está em Manutenção (status estático no DB)
  const quartoEstatico = await Quarto.findByPk(quartoId, { attributes: ['status'] });
  if (quartoEstatico && quartoEstatico.status === 'Manutenção') {
      return 'Manutenção';
  }

  // Se houver uma reserva ativa para hoje, o status é Ocupado
  if (activeReservation) {
    return 'Ocupado';
  }
  
  // Caso contrário, está Disponível
  return 'Disponível';
};

// POST /api/quartos
exports.create = async (req, res) => {
  try {
    const quarto = await Quarto.create(req.body);
    return res.status(201).send(quarto);
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: 'Erro ao cadastrar quarto. Verifique o número e os valores.' });
  }
};

// GET /api/quartos (Listagem com Status Dinâmico)
exports.list = async (req, res) => {
  try {
    const quartos = await Quarto.findAll({ 
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    // Calcular e atualizar o status dinâmico para cada quarto
    const quartosComStatusDinamico = await Promise.all(quartos.map(async (quarto) => {
      const statusDinamico = await getDynamicStatus(quarto.id);
      const quartoData = quarto.get({ plain: true }); 
      quartoData.status = statusDinamico; 

      // Filtra pelo status dinâmico se for solicitado
      if (req.query.status && req.query.status !== statusDinamico) {
        return null; 
      }

      return quartoData;
    }));

    const filteredQuartos = quartosComStatusDinamico.filter(quarto => quarto !== null);

    return res.send(filteredQuartos);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao buscar quartos.' });
  }
};

// GET /api/quartos/:id (Detalhe com Status Dinâmico)
exports.getOne = async (req, res) => {
  try {
    const quarto = await Quarto.findByPk(req.params.id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    if (!quarto) {
      return res.status(404).send({ error: 'Quarto não encontrado.' });
    }
    
    // Calcular e sobrescrever o status dinâmico
    const statusDinamico = await getDynamicStatus(quarto.id);
    const quartoData = quarto.get({ plain: true });
    quartoData.status = statusDinamico; 

    return res.send(quartoData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao buscar o quarto.' });
  }
};

// PUT /api/quartos/:id
exports.update = async (req, res) => {
  try {
    const [updated] = await Quarto.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated) {
      const updatedQuarto = await Quarto.findByPk(req.params.id);
      return res.status(200).send(updatedQuarto);
    }
    
    return res.status(404).send({ error: 'Quarto não encontrado.' });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: 'Erro ao atualizar o quarto.' });
  }
};

// DELETE /api/quartos/:id
exports.remove = async (req, res) => {
  try {
    const deleted = await Quarto.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      return res.status(204).send();
    }
    
    return res.status(404).send({ error: 'Quarto não encontrado.' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao deletar o quarto.' });
  }
};

// NOVO: Função para sincronizar o status estático no DB com o status dinâmico de hoje


        exports.syncAllStatuses = async (req, res) => {
    try {
        const quartos = await Quarto.findAll({ 
            attributes: ['id', 'numero'] // Adicionado 'numero' para facilitar o log
        });

        await Promise.all(quartos.map(async (quarto) => {
            const statusDinamico = await getDynamicStatus(quarto.id);
            
            // NOVO LOG PARA DEBUG
            console.log(`Quarto ${quarto.numero} (ID: ${quarto.id}) -> Status Calculado: ${statusDinamico}`); 
            // FIM DO NOVO LOG

            const quartoAtual = await Quarto.findByPk(quarto.id);
            if (quartoAtual.status !== 'Manutenção' || statusDinamico === 'Manutenção') {
                 await Quarto.update(
                    { status: statusDinamico },
                    { where: { id: quarto.id } }
                );
            }
        }));

        return res.send({ message: 'Status de todos os quartos sincronizado com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Erro ao sincronizar status dos quartos.' });
    }
};