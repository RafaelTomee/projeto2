// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const adminMiddleware = require('../middlewares/admin.middleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login); 

module.exports = router;