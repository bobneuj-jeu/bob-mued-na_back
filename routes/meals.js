const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
  updateMeal,
  getMeals,
  authenticateMeal,
  calculateSuccessRate,
  getSuccessRate
} = require('../controller/mealController');
const mealPlanController = require('../controller/mealPlanController')
const router = express.Router();

router.post('/create', mealPlanController.createMealPlan);
router.put('/update', updateMeal); // 식단 수정
router.get('/', getMeals); // 식단 조회
router.post('/authenticate', upload.single('mealImage'), authenticateMeal); // 식단 인증(이미지활용)
router.post('/calculateSuccessRate', calculateSuccessRate); // 식사율 계산(자동으로 성공률 페이지로 넘어감)
router.get('/successRate', getSuccessRate); // 성공률 조회

module.exports = router;