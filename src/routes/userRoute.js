const express = require('express');
const router = express.Router();
const { registerUser, loginUser, calculateSuccessRate } = require('../controllers/userController'); // 로그인 및 성공률 함수 가져오기

router.post('/signup', registerUser); // 사용자 등록
router.post('/login', loginUser); // 로그인
router.post('/success-rate', calculateSuccessRate); // 성공률 계산

module.exports = router;