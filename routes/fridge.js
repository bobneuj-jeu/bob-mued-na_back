const express = require('express');
const router = express.Router();
const fridgeController = require('../controller/fridgeController');

// 냉장고 재료 추가
router.post('/add/:username', fridgeController.addFridgeItem);

// 유저 식자재 목록 조회
router.get('/:username', fridgeController.getFridgeItems);

// 식자재 삭제
router.delete('/delete/:username', fridgeController.deleteFridgeItem);

module.exports = router;