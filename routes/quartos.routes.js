// routes/quartos.routes.js
const express = require('express');
const router = express.Router();
const QuartoController = require('../controllers/QuartoController');
const authMiddleware = require('../middlewares/auth.middleware');

// Protege todas as rotas de Quarto
router.use(authMiddleware);

// Rotas CRUD
router.get('/', QuartoController.list);         
router.post('/', QuartoController.create);      
router.get('/:id', QuartoController.getOne);    
router.put('/:id', QuartoController.update);    
router.delete('/:id', QuartoController.remove); 

module.exports = router;