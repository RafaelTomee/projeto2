// routes/reservas.routes.js
const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// Protege todas as rotas de Reserva
// 1. LISTAR TODAS AS RESERVAS (GET /): Restrito a Admin/Recepcionista
// Clientes não devem ver todas as reservas do hotel.
router.get('/', adminMiddleware, ReservaController.list);         

// 2. CRIAR RESERVA (POST /): Permitido a qualquer usuário LOGADO (Cliente ou Admin/Recepcionista)
router.post('/', authMiddleware, ReservaController.create);      

// 3. BUSCAR POR ID (GET /:id): Permitido a qualquer usuário LOGADO. 
// O Controller deve garantir que o Cliente só veja as suas.
router.get('/:id', authMiddleware, ReservaController.getOne);    

// 4. ATUALIZAR RESERVA (PUT /:id): Restrito a Admin/Recepcionista (para gerenciar as reservas de terceiros)
// *Opcional: O Controller pode permitir que o próprio cliente edite suas datas/quartos.
router.put('/:id', adminMiddleware, ReservaController.update);    

// 5. DELETAR/CANCELAR RESERVA (DELETE /:id): Restrito a Admin/Recepcionista
router.delete('/:id', adminMiddleware, ReservaController.remove);



module.exports = router;