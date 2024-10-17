const express = require('express');
const router = express.Router();
const { getSuccessRate } = require('../controllers/successRateController');
const imageValidationMiddleware = require('../middleware/imageValidationMiddleware');

// 성공률 조회 API 엔드포인트
router.get('/success-rate', imageValidationMiddleware, getSuccessRate);

module.exports = router;