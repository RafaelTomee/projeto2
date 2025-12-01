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

// =========================================================================
// FUNÇÕES DE SINCRONIZAÇÃO E STATUS (APÓS exports.remove)
// =========================================================================

// Função Core de Sincronização em Massa (usada pelo Agendador no server.js)
const runStatusSync = async () => {
    // [LÓGICA DA SINCRONIZAÇÃO EM MASSA]
    try {
        const quartos = await Quarto.findAll({ attributes: ['id', 'numero'] });
        console.log(`\n[SYNC] Iniciando sincronização de status para ${quartos.length} quartos...`);

        await Promise.all(quartos.map(async (quarto) => {
            const statusDinamico = await getDynamicStatus(quarto.id);
            const quartoAtual = await Quarto.findByPk(quarto.id);
            
            // Lógica de atualização
            if (quartoAtual.status !== 'Manutenção' || statusDinamico === 'Manutenção') {
                 console.log(`[SYNC] Quarto ${quarto.numero} -> Status Calculado: ${statusDinamico}. Atualizando DB.`);
                 await Quarto.update(
                    { status: statusDinamico },
                    { where: { id: quarto.id } }
                );
            } else {
                 console.log(`[SYNC] Quarto ${quarto.numero} -> Status Manutenção. Não atualizando DB.`);
            }
        }));

        console.log('[SYNC] Sincronização concluída.');
        return true;
    } catch (error) {
        console.error('[SYNC ERROR] Erro ao executar a sincronização:', error);
        return false;
    }
};


// Handler da Rota Express para sincronização manual
exports.syncAllStatuses = async (req, res) => {
    const success = await runStatusSync();

    if (success) {
        return res.send({ message: 'Status de todos os quartos sincronizado com sucesso.' });
    }
    return res.status(500).send({ error: 'Erro ao sincronizar status dos quartos.' });
};


// Função para atualizar o status estático de UM quarto específico (usada pelo ReservaController)
const updateSingleQuartoStatus = async (quartoId) => {
    try {
        const statusDinamico = await getDynamicStatus(quartoId);
        const quartoAtual = await Quarto.findByPk(quartoId);
        
        // Aplica a mesma lógica de não sobrescrever Manutenção
        if (quartoAtual && (quartoAtual.status !== 'Manutenção' || statusDinamico === 'Manutenção')) {
            await Quarto.update(
                { status: statusDinamico },
                { where: { id: quartoId } }
            );
            console.log(`[STATUS UPDATE] Quarto ID ${quartoId} atualizado para: ${statusDinamico}`);
        } else if (quartoAtual) {
            console.log(`[STATUS UPDATE] Quarto ID ${quartoId} em Manutenção. Não atualizando.`);
        }
    } catch (error) {
        console.error(`[STATUS UPDATE ERROR] Erro ao atualizar status do Quarto ID ${quartoId}:`, error);
    }
};


// =========================================================================
// CORREÇÃO ESSENCIAL: EXPORTAR TODAS AS FUNÇÕES NO FINAL
// (Sem o 'exports.remove' duplicado, pois ele já foi exportado acima)
// =========================================================================
module.exports = {
    create: exports.create,
    list: exports.list,
    getOne: exports.getOne,
    update: exports.update,
    remove: exports.remove, // A função remove do quarto.routes.js
    syncAllStatuses: exports.syncAllStatuses, // Handler da rota manual
    runStatusSync, // Função core para o server.js usar no agendamento
    updateSingleQuartoStatus // ✅ NOVO: Função para o ReservaController usar
};