const express = require('express'); // express 모듈 가져오기
const { signup, login} = require('../controllers/usersC'); // 컨트롤러에서 회원가입 및 로그인 함수 가져오기

const router = express.Router(); // 새로운 라우터 객체 생성

// 회원가입 라우트
router.post('/signup', signup); // POST 요청 시 회원가입 처리
// 로그인 라우트
router.post('/login', login); // POST 요청 시 로그인 처리

module.exports = router; // 라우터 모듈 내보내기