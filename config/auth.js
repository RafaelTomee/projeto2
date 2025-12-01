// config/auth.js
require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'chave-secreta-padrao-fallback',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};