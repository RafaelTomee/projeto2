const { Cliente } = require('../models');

exports.create = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    return res.status(201).send(cliente);
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: 'Erro ao cadastrar cliente. Verifique os dados (ex: CPF/Email único).' });
  }
};

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

exports.remove = async (req, res) => {
  try {
    const deleted = await Cliente.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      return res.status(204).send(); 
    }

    throw new Error('Cliente não encontrado.');
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao deletar o cliente.' });
  }
};