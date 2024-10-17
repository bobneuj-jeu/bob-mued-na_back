const express = require('express');
const router = express.Router();
const { getSuccessRate } = require('../controllers/successC');
const imgValidationMiddleware = require('../middleware/imgValidation');

// 성공률 조회 API 엔드포인트
router.get('/success-rate', imgValidationMiddleware, getSuccessRate);

module.exports = router;