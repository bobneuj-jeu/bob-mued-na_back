const { getMealData, logMealSuccess } = require('../models/success');

// 식단 성공률 계산 로직
const calculateSuccessRate = async (userId, date, images) => {
    const mealData = await getMealData(userId, date);
    if (!mealData) return 'bad';

    const mealTimes = ['breakfast', 'lunch', 'dinner'];
    const selectedMeal = mealTimes.find(time => 
        mealData.some(meal => meal.time === time && meal.selected)
    );

    if (selectedMeal) return 'not';

    const totalMeals = mealData.length;
    const imageCount = images.length;

    const successRate = (imageCount / totalMeals) * 100;

    let result;
    if (successRate >= 90) {
        result = 'good';
    } else if (successRate > 0) {
        result = 'soso';
    } else {
        result = 'bad';
    }

    await logMealSuccess(userId, mealData[0].id, result);
    return result;
};

// 성공률 조회 함수 (GET 요청)
const getSuccessRate = async (req, res) => {
    try {
        const { userId, date } = req.query; // 쿼리에서 userId와 date 가져오기

        // 유효성 검사
        if (!userId || !date) {
            return res.status(400).json({ error: 'userId와 date는 필수입니다.' });
        }

        const mealData = await getMealData(userId, date);
        if (!mealData) return res.status(404).json({ error: '식단 데이터를 찾을 수 없습니다.' });

        // 성공률 계산
        const totalMeals = mealData.length;
        const successfulMeals = mealData.filter(meal => meal.success).length; // 성공한 식사 카운트
        const successRate = (successfulMeals / totalMeals) * 100;

        res.status(200).json({ successRate: successRate });
    } catch (error) {
        console.error('성공률 조회 중 오류 발생:', error); // 오류 로그
        res.status(500).json({ error: '성공률 조회 중 오류가 발생했습니다.' });
    }
};

// 성공률 계산 및 로깅 함수 (POST 요청)
const logSuccessRate = async (req, res) => {
    try {
        const { userId, date, images } = req.body; // 요청 본문에서 데이터 가져오기

        // 유효성 검사
        if (!userId || !date || !Array.isArray(images)) {
            return res.status(400).json({ error: 'userId, date, images 배열은 필수입니다.' });
        }

        const result = await calculateSuccessRate(userId, date, images);
        res.status(200).json({ successRate: result });
    } catch (error) {
        console.error('성공률 계산 중 오류 발생:', error); // 오류 로그
        res.status(500).json({ error: '성공률 계산 중 오류가 발생했습니다.' });
    }
};

module.exports = {
    getSuccessRate,
    logSuccessRate, // 새로운 logSuccessRate 함수 내보내기
};