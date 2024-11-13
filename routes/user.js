const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// 회원가입
router.post('/signup', userController.signup);

// 로그인
router.post('/login', userController.login);

// 사용자 정보 조회
router.get('/:username', userController.getUserInfo);

// 비밀번호 변경
router.put('/change-password', userController.changePassword);

// 질환 수정
router.put('/update-diseases/:username', userController.updateUserDiseases);

module.exports = router;