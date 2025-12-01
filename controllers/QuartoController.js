// controllers/QuartoController.js
const { Quarto } = require('../models');

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

// GET /api/quartos
// Pode aceitar um parâmetro de consulta 'status' para filtrar (e.g., ?status=Disponível)
exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    const quartos = await Quarto.findAll({ 
      where, 
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    return res.send(quartos);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Erro ao buscar quartos.' });
  }
};

// GET /api/quartos/:id
exports.getOne = async (req, res) => {
  try {
    const quarto = await Quarto.findByPk(req.params.id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    if (!quarto) {
      return res.status(404).send({ error: 'Quarto não encontrado.' });
    }
    return res.send(quarto);
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