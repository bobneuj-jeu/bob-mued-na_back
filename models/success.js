const pool = require('../config/db'); // DB 연결 설정 가져오기

// 특정 사용자의 식단 데이터를 가져오는 함수
const getMealData = async (userId, date) => {
    const [mealData] = await pool.query('SELECT * FROM MealPlan WHERE userId = ? AND date = ?', [userId, date]);
    return mealData;
};

// 식사 성공률 기록을 위한 함수
const logMealSuccess = async (userId, mealPlanId, mealSuccess) => {
    await pool.query(
        'INSERT INTO meal_logs (user_id, meal_plan_id, meal_success) VALUES (?, ?, ?)', 
        [userId, mealPlanId, mealSuccess]
    );
};

module.exports = {
    getMealData,
    logMealSuccess,
};