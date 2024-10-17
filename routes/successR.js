const express = require('express');
const router = express.Router();
const { getSuccessRate, logSuccessRate } = require('../controllers/successC');
const imgValidationMiddleware = require('../middleware/imgValidation');

// 성공률 조회 (GET 요청)
router.get('/success-rate', getSuccessRate); // GET 메소드 사용

// 성공률 판단 (POST 요청)
router.post('/', imgValidationMiddleware, logSuccessRate); // POST 메소드 사용 (userId를 요청 본문에서 가져옴)

module.exports = router;