// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const { sequelize } = require('./models');
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/clientes.routes');
const quartoRoutes = require('./routes/quartos.routes'); // NOVA ROTA
const reservaRoutes = require('./routes/reservas.routes'); // NOVA ROTA

const { sequelize, User } = require('./models'); // <-- Adicione 'User' aqui
const bcrypt = require('bcrypt');                 // <-- Adicione 'bcrypt' aqui

const quartoController = require('./controllers/QuartoController');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Permite que o Express leia JSON no corpo da requisição

// Rotas
app.get('/', (req, res) => {
  res.send('API de Gerenciamento de Hotel rodando!');
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/quartos', quartoRoutes); // USO DA NOVA ROTA
app.use('/api/reservas', reservaRoutes); // USO DA NOVA ROTA

// Sincroniza o banco de dados e inicia o servidor
sequelize.sync()
  .then(async () => {

    

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🔗 Banco de dados sincronizado com sucesso.`);
      
      // -----------------------------------------------------------------
      // ✅ LÓGICA DE AGENDAMENTO DE STATUS
      // -----------------------------------------------------------------
      const SYNC_INTERVAL_MS = 10* 1000; // 30 minutos em milissegundos
      
      // 1. Executa a sincronização imediatamente no início
      quartoController.runStatusSync();

      // 2. Agenda a execução periódica
      setInterval(() => {
        quartoController.runStatusSync();
      }, SYNC_INTERVAL_MS);
      
      console.log(`🕒 Sincronização de status agendada a cada 10 minutos.`); 
    });
  })
  .catch(err => {
    console.error('❌ Erro ao conectar/sincronizar o banco de dados:', err);
  });