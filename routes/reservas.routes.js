// routes/reservas.routes.js
const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const authMiddleware = require('../middlewares/auth.middleware');

// Protege todas as rotas de Reserva
router.use(authMiddleware);

// Rotas CRUD
router.get('/', ReservaController.list);         
router.post('/', ReservaController.create);      
router.get('/:id', ReservaController.getOne);    // Adicione esta função ao controller se precisar
router.put('/:id', ReservaController.update);    
router.delete('/:id', ReservaController.remove);

module.exports = router;