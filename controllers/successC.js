const { getMealData, logMealSuccess } = require('../models/mealModel');

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

// 성공률 조회 함수
const getSuccessRate = async (req, res) => {
    try {
        const { userId, date } = req.query;
        const images = req.body.images;

        const result = await calculateSuccessRate(userId, date, images);
        res.status(200).json({ successRate: result });
    } catch (error) {
        res.status(500).json({ error: '성공률 계산 중 오류가 발생했습니다.' });
    }
};

module.exports = {
    getSuccessRate,
};