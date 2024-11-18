const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
  createMeal,
  updateMeal,
  getMeals,
  authenticateMeal,
  calculateSuccessRate,
  getSuccessRate
} = require('../controller/mealController');
const router = express.Router();

router.post('/create', createMeal);
router.put('/update', updateMeal);
router.get('/', getMeals);
router.post('/authenticate', upload.single('mealImage'), authenticateMeal);
router.post('/calculateSuccessRate', calculateSuccessRate);
router.get('/successRate', getSuccessRate);

module.exports = router;