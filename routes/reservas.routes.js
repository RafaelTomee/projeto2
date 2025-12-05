// routes/reservas.routes.js
const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/', adminMiddleware, ReservaController.list);

router.post('/', authMiddleware, ReservaController.create);

router.get('/:id', authMiddleware, ReservaController.getOne); 

router.put('/:id', adminMiddleware, ReservaController.update); 

router.delete('/:id', adminMiddleware, ReservaController.remove);



module.exports = router;