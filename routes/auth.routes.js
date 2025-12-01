// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.post('/register', AuthController.register); // Criar novo usuário (Pode ser removido após o primeiro admin ser criado)
router.post('/login', AuthController.login);   // Fazer login e obter token

module.exports = router;