const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const upload = require('../middleware/upload');
const multer = require('multer');

// 식사 날짜 및 시간 선택
router.post('/selectMealTime', mealController.selectMealTime);

// 식단 작성
router.post('/createMealPlan', mealController.createMealPlan);

// 식단 수정
router.put('/updateMealPlan', mealController.updateMealPlan);

// 식단 조회
router.get('/viewMealPlan', mealController.viewMealPlan);

// 식사 인증 (이미지 업로드 포함)
router.post('/authenticateMeal', upload.single('mealImage'), mealController.authenticateMeal);

// 식사 성공률 계산
router.get('/calculateSuccessRate', mealController.calculateSuccessRate);

// 식사 성공률 조회
router.get('/viewSuccessRate', mealController.viewSuccessRate);

module.exports = router;