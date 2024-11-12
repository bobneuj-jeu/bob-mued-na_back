const express = require('express');
const router = express.Router();
const mealsController = require('../controller/mealController');

router.get('/weekly/:username', mealsController.getWeeklyMeals);
router.put('/update', mealsController.updateMeal);
router.get('/monthly-success-rate/:username', mealsController.getMonthlySuccessRate);
router.get('/calendar-success-rate/:username', mealsController.getCalendarSuccessRate);

module.exports = router;

/*
// create 시 request 예시
{
  "username": "test23",
  "meal_date": "2024-11-12",
  "meal_time": "12:00:00",
  "food_item_ids": "1,2,3",
  "success_rate": 85
}

*/