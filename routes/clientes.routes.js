// routes/clientes.routes.js
const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/', authMiddleware, ClienteController.list); 
router.get('/:id', authMiddleware, ClienteController.getOne);

router.post('/', adminMiddleware, ClienteController.create);
router.put('/:id', adminMiddleware, ClienteController.update); 
router.delete('/:id', adminMiddleware, ClienteController.remove); 

module.exports = router;