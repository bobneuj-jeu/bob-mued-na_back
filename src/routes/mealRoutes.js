const express = require('express');
const router = express.Router();
const { updateMealPlan, createMealPlan, addMealPlan, getMealPlansByDate } = require('../controllers/mealController');

// 식단 수정
router.put('/save', updateMealPlan);

// AI를 통한 식단 생성
router.post('/generate', createMealPlan);

// 식사 계획 추가
router.post('/mealPlan', addMealPlan);

// 특정 날짜의 식사 계획 조회
router.get('/meal/:userId/:mealDate', getMealPlansByDate);

module.exports = router;