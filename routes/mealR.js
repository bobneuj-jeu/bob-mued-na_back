const express = require('express');
const router = express.Router();
const { 
    getMealPlan,           // 식단 조회 핸들러
    getUserInfo,           // 사용자 정보 조회 핸들러
    postGenerate,          // AI 식단 생성 핸들러
    saveModifiedMealPlan,  // 수정된 식단 저장 핸들러
    updateMeal             // 식사 업데이트 핸들러
} = require('../controllers/mealC');

// 식단 조회 (GET 요청)
router.get('/meal-plan', getMealPlan);

// 사용자 정보 조회 (GET 요청)
router.get('/user-info', getUserInfo);

// AI 식단 생성 (POST 요청)
router.post('/generate', postGenerate);

// 수정된 식단 저장 (POST 요청)
router.post('/save', saveModifiedMealPlan);

// 식사 업데이트 (PUT 요청)
router.put('/update/:userId', updateMeal);

module.exports = router;