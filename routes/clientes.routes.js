// routes/clientes.routes.js
const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// Aplica o middleware de autenticação para proteger todas as rotas de Cliente
router.get('/', authMiddleware, ClienteController.list);         
router.get('/:id', authMiddleware, ClienteController.getOne);

// Rotas de ALTERAÇÃO (POST, PUT, DELETE): Requer perfil 'admin' ou 'recepcionista' (adminMiddleware)
router.post('/', adminMiddleware, ClienteController.create);      // <-- Aplicado
router.put('/:id', adminMiddleware, ClienteController.update);    // <-- Aplicado
router.delete('/:id', adminMiddleware, ClienteController.remove); // <-- Aplicado

module.exports = router;