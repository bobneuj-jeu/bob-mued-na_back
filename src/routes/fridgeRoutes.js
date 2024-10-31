const express = require('express');
const { createFridgeItem, getFridgeItems, removeFridgeItem } = require('../controllers/fridgeController');

const router = express.Router();

// 재료추가
router.post('/', createFridgeItem); 

// 재료조회
router.post('/items', getFridgeItems); 

// 재료삭제
router.delete('/remove', removeFridgeItem);

module.exports = router;