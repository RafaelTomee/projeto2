const { Quarto, Reserva, sequelize } = require('../models');
const { Op } = require('sequelize');
const { format } = require('date-fns');

const getDynamicStatus = async (quartoId) => {

  const today = format(new Date(), 'yyyy-MM-dd');

  const activeReservation = await Reserva.findOne({
    where: {
      quartoId: quartoId,
      status: { [Op.in]: ['Confirmada', 'Check-In'] },

      dataCheckIn: { [Op.lte]: today },
      dataCheckOut: { [Op.gt]: today },
    }
  });

  const quartoEstatico = await Quarto.findByPk(quartoId, { attributes: ['status'] });
  if (quartoEstatico && quartoEstatico.status === 'Manutenção') {
    return 'Manutenção';
  }

  if (activeReservation) {
    return 'Ocupado';
  }

  return 'Disponível';
};

exports.create = async (req, res) => {
  try {
    let { numero, tipo, valorDiaria, capacidade } = req.body;

    let valorDiariaFloat = valorDiaria ? parseFloat(valorDiaria) : NaN;

    if (isNaN(valorDiariaFloat) || valorDiariaFloat < 0) {
      return res.status(400).send({
        error: 'O valor da diária é obrigatório e deve ser um número válido e não negativo.'
      });
    }

    const quartoData = {
      numero,
      tipo,
      valorDiaria: valorDiariaFloat,
      capacidade,
      status: req.body.status || 'Disponível'
    };

    const quarto = await Quarto.create(quartoData);

    return res.status(201).send(quarto);
  } catch (error) {
    console.error(error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).send({ error: error.errors.map(e => e.message).join(', ') });
    }

    return res.status(400).send({ error: 'Erro ao cadastrar quarto. Verifique o número e os valores.' });
  }
};

exports.list = async (req, res) => {
  try {
    const quartos = await Quarto.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      order: [
        ['numero', 'ASC']
      ]
    });

    const quartosComStatusDinamico = await Promise.all(quartos.map(async (quarto) => {
      const statusDinamico = await getDynamicStatus(quarto.id);
      const quartoData = quarto.get({ plain: true });
      quartoData.status = statusDinamico;

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

exports.getOne = async (req, res) => {
  try {
    const quarto = await Quarto.findByPk(req.params.id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!quarto) {
      return res.status(404).send({ error: 'Quarto não encontrado.' });
    }

    const statusDinamico = await getDynamicStatus(quarto.id);
    const quartoData = quarto.get({ plain: true });
    quartoData.status = statusDinamico;

    return res.send(quartoData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao buscar o quarto.' });
  }
};

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

const runStatusSync = async () => {

  try {
    const quartos = await Quarto.findAll({ attributes: ['id', 'numero'] });
    console.log(`\n[SYNC] Iniciando sincronização de status para ${quartos.length} quartos...`);

    await Promise.all(quartos.map(async (quarto) => {
      const statusDinamico = await getDynamicStatus(quarto.id);
      const quartoAtual = await Quarto.findByPk(quarto.id);

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


exports.syncAllStatuses = async (req, res) => {
  const success = await runStatusSync();

  if (success) {
    return res.send({ message: 'Status de todos os quartos sincronizado com sucesso.' });
  }
  return res.status(500).send({ error: 'Erro ao sincronizar status dos quartos.' });
};


const updateSingleQuartoStatus = async (quartoId) => {
  try {
    const statusDinamico = await getDynamicStatus(quartoId);
    const quartoAtual = await Quarto.findByPk(quartoId);

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

module.exports = {
  create: exports.create,
  list: exports.list,
  getOne: exports.getOne,
  update: exports.update,
  remove: exports.remove,
  syncAllStatuses: exports.syncAllStatuses,
  runStatusSync,
  updateSingleQuartoStatus
};