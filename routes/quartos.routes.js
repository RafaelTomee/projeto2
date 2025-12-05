// routes/quartos.routes.js

const express = require('express');
const router = express.Router();
const QuartoController = require('../controllers/QuartoController');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/', authMiddleware, QuartoController.list); 

router.post('/', adminMiddleware, QuartoController.create);

router.get('/:id', authMiddleware, QuartoController.getOne); 

router.put('/:id', adminMiddleware, QuartoController.update); 

router.delete('/:id', adminMiddleware, QuartoController.remove); 

router.post('/sync-status', adminMiddleware, QuartoController.syncAllStatuses);


router.post('/sync-status', QuartoController.syncAllStatuses); 

module.exports = router;