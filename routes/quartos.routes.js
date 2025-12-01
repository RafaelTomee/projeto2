// routes/quartos.routes.js

const express = require('express');
const router = express.Router();
const QuartoController = require('../controllers/QuartoController');
const authMiddleware = require('../middlewares/auth.middleware');

// Rotas protegidas por autenticação
router.use(authMiddleware);

// Rotas CRUD
router.get('/', QuartoController.list);         
router.post('/', QuartoController.create);      
router.get('/:id', QuartoController.getOne);    
router.put('/:id', QuartoController.update);    
router.delete('/:id', QuartoController.remove); 

// Rota para sincronizar o status no DB (Deve vir DEPOIS do router.use(authMiddleware);)
router.post('/sync-status', QuartoController.syncAllStatuses); 

module.exports = router;