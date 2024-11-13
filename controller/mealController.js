const Meal = require('../models/meal');
const sequelize = require('../config/db');

// 식단 작성
exports.createMeal = async (req, res) => {
  try {
    const { username, meal_date, meal_time, food_item_ids} = req.body;

    // 새로운 식단 추가
    await Meal.create({ username, meal_date, meal_time, food_item_ids, success_rate });

    res.status(201).json({ message: '식단이 성공적으로 작성되었습니다.' });
  } catch (error) {
    console.error('식단 작성 에러:', error.message);
    res.status(500).json({ message: '식단 작성 중 오류가 발생했습니다.', error: error.message });
  }
};

// 이번 달 평균 식사율 조회
exports.getMonthlySuccessRate = async (req, res) => {
  try {
    const { username } = req.params;

    const result = await Meal.findOne({
      attributes: [
        [sequelize.fn('PNG', sequelize.col('success_rate')), 'average_success_rate']
      ],
      where: {
        username,
        meal_date: {
          [sequelize.Op.gte]: sequelize.fn('DATE_FORMAT', sequelize.fn('NOW'), '%Y-%m-01'),
          [sequelize.Op.lte]: sequelize.fn('NOW')
        }
      }
    });

    res.json({ average_success_rate: result ? result.get('average_success_rate') : null });
  } catch (error) {
    console.error('월간 식사율 조회 에러:', error.message);
    res.status(500).json({ message: '식사율 조회 중 오류가 발생했습니다.', error: error.message });
  }
};

// 이번 주 식단 조회
exports.getWeeklyMeals = async (req, res) => {
  try {
    const { username } = req.params;

    const meals = await Meal.findAll({
      where: {
        username,
        meal_date: {
          [sequelize.Op.gte]: sequelize.fn('DATE_SUB', sequelize.fn('NOW'), sequelize.literal('INTERVAL WEEKDAY(NOW()) DAY')),
          [sequelize.Op.lte]: sequelize.fn('NOW')
        }
      }
    });

    res.json(meals);
  } catch (error) {
    console.error('이번주 식단 조회 에러:', error.message);
    res.status(500).json({ message: '식단 조회 중 오류가 발생했습니다.', error: error.message });
  }
};

// 식단 수정
exports.updateMeal = async (req, res) => {
  try {
    const { id, meal_date, meal_time, food_item_ids} = req.body;

    const meal = await Meal.findByPk(id);
    if (!meal) {
      return res.status(404).json({ message: '해당 식단을 찾을 수 없습니다.' });
    }

    meal.meal_date = meal_date;
    meal.meal_time = meal_time;
    meal.food_item_ids = food_item_ids;

    await meal.save();

    res.status(200).json({ message: '식단이 수정되었습니다.' });
  } catch (error) {
    console.error('식단 수정 에러:', error.message);
    res.status(500).json({ message: '식단 수정 중 오류가 발생했습니다.', error: error.message });
  }
};

// 달력에 성공률 표시 (이번 달)
exports.getCalendarSuccessRate = async (req, res) => {
  try {
    const { username } = req.params;

    const meals = await Meal.findAll({
      where: {
        username,
        meal_date: {
          [sequelize.Op.gte]: sequelize.fn('DATE_FORMAT', sequelize.fn('NOW'), '%Y-%m-01'),
          [sequelize.Op.lte]: sequelize.fn('NOW')
        }
      },
      attributes: ['meal_date', 'success_rate']
    });

    const calendarData = meals.map(meal => {
      const date = meal.meal_date.getDate();
      let status = 'no-meal'; // 기본값은 식단 없음

      if (meal.success_rate === 100) status = 'success';
      else if (meal.success_rate > 0) status = 'partial-success';
      else if (meal.success_rate === 0) status = 'failure';

      return { date, status };
    });

    res.json(calendarData);
  } catch (error) {
    console.error('달력 성공률 표시 에러:', error.message);
    res.status(500).json({ message: '달력 성공률 표시 중 오류가 발생했습니다.', error: error.message });
  }
};