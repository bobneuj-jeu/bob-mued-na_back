const db = require('../database/db'); // DB 연결
const { generateMealPlanAI } = require('../utils/openAI'); // OpenAI 유틸리티 임포트

// 사용자의 식단 생성 함수
const createMealPlan = async (req, res) => {
  const { userId } = req.body;

  try {
    const mealPlan = await generateMealPlanAI(userId); // AI를 통한 식단 생성
    res.status(200).json({ message: '식단이 성공적으로 생성되었습니다.', mealPlan });
  } catch (error) {
    res.status(500).json({ message: '식단 생성 중 오류 발생', error });
  }
};

const getMealPlansByDate = async (req, res) => {
  const { userId, mealDate } = req.params;

  try {
      const mealPlans = await db.query(
          'SELECT * FROM meal_plans WHERE user_id = ? AND meal_date = ?',
          [userId, mealDate]
      );

      // meal_description은 JSON 형태이므로 필요에 따라 파싱할 수 있습니다.
      res.status(200).json(mealPlans.map(plan => ({
          ...plan,
          meal_description: JSON.parse(plan.meal_description) // JSON 파싱
      })));
  } catch (error) {
      console.error("식사 계획 조회 중 오류 발생:", error);
      res.status(500).json({ message: '내부 서버 오류' });
  }
};

const createDietPlan = (user, excludedMealTimes, mealDate) => {
  const dietPlan = {
      breakfast: [],
      lunch: [],
      dinner: [],
  };

  // 식사 시간에 따라 추천
  Object.keys(meals).forEach(mealTime => {
      if (!excludedMealTimes.includes(mealTime)) {
          const meal = meals[mealTime];
          // 무작위로 식사 선택
          for (let i = 0; i < 3; i++) { // 각 식사 시간마다 3개의 음식을 선택
              const randomMeal = meal[Math.floor(Math.random() * meal.length)];
              dietPlan[mealTime].push(randomMeal);
          }
      }
  });

  return dietPlan;
};

const addMealPlan = async (req, res) => {
  const { userId, mealDate, mealTime, mealDescription } = req.body;

  try {
      // 해당 날짜와 시간의 기존 식사 계획 조회
      const existingMeal = await db.query(
          'SELECT * FROM meal_plans WHERE user_id = ? AND meal_date = ? AND meal_time = ?',
          [userId, mealDate, mealTime]
      );

      // 이미 존재하는 경우
      if (existingMeal.length > 0) {
          return res.status(400).json({ message: '이미 존재하는 식사 계획입니다.' });
      }

      // 새 식사 계획 추가
      const result = await db.query(
          'INSERT INTO meal_plans (user_id, meal_date, meal_time, meal_description) VALUES (?, ?, ?, ?)',
          [userId, mealDate, mealTime, JSON.stringify(mealDescription)] // JSON.stringify로 변환
      );

      // 성공률 계산 (이미지 URL이 제공된 경우)
      const successRate = imageUrl ? 100 : 0; // 이미지를 올린 경우 성공률 100%

      // 성공률 업데이트
      await db.query(
          'UPDATE meal_plans SET success_rate = ? WHERE id = ?',
          [successRate, result.insertId]
      );

      res.status(201).json({ message: '식사 계획이 추가되었습니다!', success_rate: successRate });
  } catch (error) {
      console.error("식사 계획 추가 중 오류 발생:", error);
      res.status(500).json({ message: '내부 서버 오류' });
  }
};

module.exports = {
  createMealPlan,
  addMealPlan,
  getMealPlansByDate
};