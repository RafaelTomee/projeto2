// routes/clientes.routes.js
const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');
const authMiddleware = require('../middlewares/auth.middleware');

// Aplica o middleware de autenticação para proteger todas as rotas de Cliente
router.use(authMiddleware);

// Rotas CRUD
router.get('/', ClienteController.list);         
router.post('/', ClienteController.create);      
router.get('/:id', ClienteController.getOne);    
router.put('/:id', ClienteController.update);    
router.delete('/:id', ClienteController.remove); 

module.exports = router;