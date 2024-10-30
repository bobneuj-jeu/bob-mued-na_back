const express = require('express');
const { createFridgeItem, getFridgeItems, editFridgeItem, removeFridgeItem } = require('../controllers/fridgeController');

const router = express.Router();

// 냉장고 재료 추가
router.post('/', createFridgeItem);

// 사용자 냉장고 재료 조회
router.get('/:userId', getFridgeItems);

// 냉장고 재료 수정
router.put('/:itemId', editFridgeItem);

// 냉장고 재료 삭제
router.delete('/:itemId', removeFridgeItem);

module.exports = router;