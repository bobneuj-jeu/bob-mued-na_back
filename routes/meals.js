const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const upload = require('../middleware/upload');  // 이미지 업로드 미들웨어

// 식사 날짜 및 시간 선택
router.post('/', mealController.selectMealTime);

// 식단 작성
router.post('/create', mealController.createMealPlan);

// 식단 수정
router.put('/update-meal-plan', mealController.updateMealPlan);

// 식단 조회
router.get('/view-meal-plan', mealController.viewMealPlan);

// 식단 인증 (이미지 업로드 포함)
router.post('/authenticate', upload.single('meal_image'), mealController.authenticateMeal);

// 식사률 계산
router.get('/success', mealController.calculateSuccessRate);

// 식사률 조회
router.get('/viewSuccess', mealController.viewSuccessRate);

module.exports = router;