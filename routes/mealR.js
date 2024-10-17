const express = require('express');
const router = express.Router();
const { getMealPlan, getUserInfo, postGenerate, saveModifiedMealPlan, updateMeal } = require('../controllers/mealC');

// 식단 조회 (GET 요청)
router.get('/meal-plan/:userId', getMealPlan);

// 사용자 정보 조회 (GET 요청)
router.get('/user-info', getUserInfo);

// AI 식단 생성 (POST 요청)
router.post('/generate', postGenerate);

// 수정된 식단 저장 (POST 요청)
router.post('/save', saveModifiedMealPlan);

// 식사 업데이트 (PUT 요청)
router.put('/update/:userId', updateMeal); // 핸들러가 잘 정의되었는지 확인

module.exports = router;