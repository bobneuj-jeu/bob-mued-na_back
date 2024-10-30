// src/routes/userRoutes.js
const express = require('express');
const { register, login } = require('../controllers/userController');

const router = express.Router();

// 사용자 등록 경로
router.post('/signup', registerUser);

// 사용자 로그인 경로
router.post('/login', login);

module.exports = router;