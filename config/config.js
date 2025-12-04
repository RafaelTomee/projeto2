// Primeiro, carregamos as variáveis do .env
require('dotenv').config();

module.exports = {
  // Configuração para o ambiente de desenvolvimento (que é o padrão)
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    // ESSA linha resolve o erro "Dialect needs to be explicitly supplied"
    dialect: process.env.DB_DIALECT, 
  },
  // Você pode repetir esta configuração para 'test' e 'production' se necessário
  // ...
};