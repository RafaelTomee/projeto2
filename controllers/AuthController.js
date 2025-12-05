const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authConfig = require('../config/auth');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (await User.findOne({ where: { email } })) {
      return res.status(400).send({ error: 'Usuário já existe.' });
    }

    const user = await User.create({ email, password });

    const token = jwt.sign({ id: user.id, role: user.role }, authConfig.secret, { 
      expiresIn: authConfig.expiresIn,
    });

    return res.status(201).send({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Falha no registro do usuário.' });
  }
  
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.validPassword(password)) {
      return res.status(401).send({ error: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, authConfig.secret, { 
      expiresIn: authConfig.expiresIn,
    });

    res.send({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Falha no processo de login.' });
  }
};