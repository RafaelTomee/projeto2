// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/clientes.routes');
const quartoRoutes = require('./routes/quartos.routes'); 
const reservaRoutes = require('./routes/reservas.routes'); 

const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');              

const quartoController = require('./controllers/QuartoController');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('API de Gerenciamento de Hotel rodando!');
});


app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/quartos', quartoRoutes);
app.use('/api/reservas', reservaRoutes);

sequelize.sync()
  .then(async () => {

    

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Banco de dados sincronizado com sucesso.`);
      
      const SYNC_INTERVAL_MS = 10* 1000; 
      
      quartoController.runStatusSync();

      setInterval(() => {
        quartoController.runStatusSync();
      }, SYNC_INTERVAL_MS);
      
      console.log(`Sincronização de status agendada a cada 10 segundos.`); 
    });
  })
  .catch(err => {
    console.error('Erro ao conectar/sincronizar o banco de dados:', err);
  });