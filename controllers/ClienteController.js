// controllers/ClienteController.js
const { Cliente } = require('../models');

// POST /api/clientes
exports.create = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    return res.status(201).send(cliente);
  } catch (error) {
    console.error(error);
    // Erros 400 podem ser violações de unique (cpf) ou not null
    return res.status(400).send({ error: 'Erro ao cadastrar cliente. Verifique os dados (ex: CPF/Email único).' });
  }
};

// GET /api/clientes
exports.list = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    return res.send(clientes);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao buscar clientes.' });
  }
};

// GET /api/clientes/:id
exports.getOne = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    if (!cliente) {
      return res.status(404).send({ error: 'Cliente não encontrado.' });
    }

    return res.send(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao buscar o cliente.' });
  }
};

// PUT /api/clientes/:id
exports.update = async (req, res) => {
  try {
    const [updated] = await Cliente.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated) {
      const updatedCliente = await Cliente.findByPk(req.params.id);
      return res.status(200).send(updatedCliente);
    }
    
    throw new Error('Cliente não encontrado ou falha na atualização');
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: 'Erro ao atualizar o cliente.' });
  }
};

// DELETE /api/clientes/:id
exports.remove = async (req, res) => {
  try {
    const deleted = await Cliente.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      return res.status(204).send(); // 204 No Content
    }

    throw new Error('Cliente não encontrado.');
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao deletar o cliente.' });
  }
};