const Meal = require('../models/meal');
const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

// 식단 작성
const createMeal = async (req, res) => {
  const { username, meal_date, meal_time } = req.body;

  try {
    if (!username || !meal_date) {
      return res.status(400).json({ message: 'Username과 meal_date는 필수입니다.' });
    }

    const mealTime = meal_time || '없음';
    return res.status(201).json({message:'식단이 성공적으로 작성되었습니다.'});
  } catch (error) {
    console.error('식단 작성 중 오류:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 식단 수정
const updateMeal = async (req, res) => {
  const { meal_id, meal_date, meal_time } = req.body;

  try {
    const meal = await Meal.findByPk(meal_id);
    if (!meal) return res.status(404).json({ message: '식단을 찾을 수 없습니다.' });

    meal.meal_date = new Date(meal_date || meal.meal_date);
    meal.meal_time = meal_time || meal.meal_time;

    await meal.save();
    return res.status(200).json(meal);
  } catch (error) {
    console.error('식단 수정 중 오류:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 식단 조회
const getMeals = async (req, res) => {
  const { username } = req.query;

  try {
    const meals = await Meal.findAll({ where: { username } });
    if (meals.length === 0) return res.status(404).json({ message: '식단이 없습니다.' });

    return res.status(200).json(meals);
  } catch (error) {
    console.error('식단 조회 중 오류:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 식단 인증
const authenticateMeal = async (req, res) => {
  const { meal_id } = req.body;
  const mealImage = req.file;

  try {
    const meal = await Meal.findByPk(meal_id);
    if (!meal) return res.status(404).json({ message: '식단을 찾을 수 없습니다.' });

    const currentDate = new Date();
    const mealDate = new Date(meal.meal_date);
    const dayDiff = (currentDate - mealDate) / (1000 * 3600 * 24);

    if (dayDiff > 1) return res.status(400).json({ message: '당일과 이전일만 인증 가능합니다.' });

    const imagePath = path.join(__dirname, '../uploads', mealImage.originalname);
    fs.renameSync(mealImage.path, imagePath);

    meal.success_rate = 100;
    await meal.save();

    return res.status(200).json({ message: '식단 인증 완료' });
  } catch (error) {
    console.error('식단 인증 중 오류:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 식사률 계산
const calculateSuccessRate = async (req, res) => {
  const { username } = req.body;

  try {
    const meals = await Meal.findAll({
      where: { username, meal_date: { [Sequelize.Op.gte]: new Date() - 7 * 24 * 60 * 60 * 1000 } }
    });

    const totalMeals = meals.length;
    const successfulMeals = meals.filter(meal => meal.success_rate === 100).length;
    const successRate = (successfulMeals / totalMeals) * 100;

    for (let meal of meals) {
      meal.success_rate = successRate;
      await meal.save();
    }

    return res.status(200).json({ successRate });
  } catch (error) {
    console.error('식사률 계산 중 오류:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 식사률 조회
const getSuccessRate = async (req, res) => {
  const { username } = req.query;

  try {
    const meals = await Meal.findAll({ where: { username } });
    const totalMeals = meals.length;
    const successfulMeals = meals.filter(meal => meal.success_rate === 100).length;
    const successRate = (successfulMeals / totalMeals) * 100;

    return res.status(200).json({ successRate });
  } catch (error) {
    console.error('식사성공률 조회 중 오류:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};

module.exports = {
  createMeal,
  updateMeal,
  getMeals,
  authenticateMeal,
  calculateSuccessRate,
  getSuccessRate
};