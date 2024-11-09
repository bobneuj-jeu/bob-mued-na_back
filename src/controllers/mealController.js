const db = require('../database/db'); // DB 연결
const { generateMealPlanAI } = require('../utils/openAI'); // OpenAI 유틸리티 임포트

// 입력 유효성 검사용 라이브러리
const { body, validationResult } = require('express-validator');

// 식단 생성
const createMealPlan = async (req, res) => {
  const { username } = req.body;

  // 유효성 검사
  if (!username) {
    return res.status(400).json({ message: 'username는 필수입니다.' });
  }

  try {
    const mealPlan = await generateMealPlanAI(username); // AI를 통한 식단 생성
    res.status(200).json({ message: '식단이 성공적으로 생성되었습니다.', mealPlan });
  } catch (error) {
    console.error("식단 생성 중 오류 발생:", error);
    res.status(500).json({ message: '식단 생성 중 오류 발생', error: error.message });
  }
};

// 식단 조회
const getMealPlansByDate = async (req, res) => {
  const { username, mealDate } = req.query; // Change to req.query

  // 유효성 검사
  if (!username || !mealDate) {
    return res.status(400).json({ message: 'id 및 mealDate는 필수입니다.' });
  }

  // 날짜 유효성 검사
  const date = new Date(mealDate);
  const today = new Date();
  const weekFromToday = new Date();

  try {
    const mealPlans = await db.query(
      'SELECT * FROM meal_plans WHERE user_id = ? AND meal_date = ?',
      [username, mealDate]
    );

    res.status(200).json(mealPlans.map(plan => ({
      ...plan,
      meal_description: JSON.parse(plan.meal_description) // JSON 파싱
    })));
  } catch (error) {
    console.error("식사 계획 조회 중 오류 발생:", error);
    res.status(500).json({ message: '내부 서버 오류', error: error.message });
  }
};

// 식단 업데이트
const updateMealPlan = async (req, res) => {
  const { mealId, mealData } = req.body;

  // 유효성 검사
  if (!mealId || !mealData) {
    return res.status(400).json({ message: 'mealId 및 mealData는 필수입니다.' });
  }

  const query = `UPDATE meal_plans SET meal_description = ? WHERE id = ?`;

  try {
    await db.query(query, [JSON.stringify(mealData), mealId]);
    res.status(200).json({ message: '식단이 업데이트되었습니다.' });
  } catch (error) {
    console.error("식단 업데이트 중 오류 발생:", error);
    res.status(500).json({ message: '식단 업데이트 중 오류 발생', error: error.message });
  }
};

module.exports = {
  updateMealPlan,
  createMealPlan,
  getMealPlansByDate
};