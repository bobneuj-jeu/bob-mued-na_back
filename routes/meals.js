const express = require('express');
const router = express.Router();
const mealController = require('../controller/mealController');

// 식단 작성
router.post('/create', mealController.createMeal);

// 이번 달 평균 식사율 조회
router.get('/success-rate/:username', mealController.getMonthlySuccessRate);

// 이번 주 식단 조회
router.get('/weekly/:username', mealController.getWeeklyMeals);

// 식단 수정
router.put('/update', mealController.updateMeal);

// 달력에 성공률 표시 (이번 달)
router.get('/calendar/:username', mealController.getCalendarSuccessRate);

module.exports = router;