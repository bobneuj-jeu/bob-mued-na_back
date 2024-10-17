const express = require('express');
const router = express.Router();
const { getSuccessRate } = require('../controllers/successC');
const imgValidationMiddleware = require('../middleware/imgValidation');

// 성공률 판단 (POST 요청)
router.post('/:userId', imgValidationMiddleware, getSuccessRate);

// 성공률 조회 (GET 요청)
router.get('/:userId', imgValidationMiddleware, getSuccessRate);

module.exports = router;