// routes/quartos.routes.js

const express = require('express');
const router = express.Router();
const QuartoController = require('../controllers/QuartoController');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// Rotas protegidas por autenticação
// 1. Rota de Listagem (GET /): Acesso para QUALQUER USUÁRIO AUTENTICADO (Admin ou Cliente)
router.get('/', authMiddleware, QuartoController.list);         

// 2. Rota de Criação (POST /): Restrito a Admin/Recepcionista
router.post('/', adminMiddleware, QuartoController.create);      

// 3. Rota de Visualização por ID (GET /:id): Acesso para QUALQUER USUÁRIO AUTENTICADO
router.get('/:id', authMiddleware, QuartoController.getOne);    

// 4. Rota de Edição (PUT /:id): Restrito a Admin/Recepcionista
router.put('/:id', adminMiddleware, QuartoController.update);    

// 5. Rota de Exclusão (DELETE /:id): Restrito a Admin/Recepcionista
router.delete('/:id', adminMiddleware, QuartoController.remove); 

// 6. Rota de Sincronização de Status (POST /sync-status): Restrito a Admin/Recepcionista
router.post('/sync-status', adminMiddleware, QuartoController.syncAllStatuses);


// Rota para sincronizar o status no DB (Deve vir DEPOIS do router.use(authMiddleware);)
router.post('/sync-status', QuartoController.syncAllStatuses); 

module.exports = router;