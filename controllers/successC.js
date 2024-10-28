const { getMealData, logMealSuccess } = require('../models/success');

// 성공률 계산 유틸리티 함수
const calculateRate = (successfulCount, totalCount) => {
    return totalCount === 0 ? 0 : (successfulCount / totalCount) * 100; // 총 식단 수가 0일 경우 0 반환
};

// 성공률 계산 및 로깅 함수
const calculateAndLogSuccessRate = async (userId, weekStartDate, images) => {
    const mealData = await getMealData(userId, weekStartDate); // 주어진 사용자와 주의 시작 날짜의 식단 데이터 가져오기
    if (!mealData) return 'bad'; // 식단 데이터가 없으면 'bad' 반환

    // 선택된 식단이 있는지 확인
    if (mealData.some(meal => meal.selected)) return 'not'; // 선택된 식단이 있을 경우 'not' 반환

    const totalMeals = mealData.length; // 총 식단 수 계산
    const successRate = calculateRate(images.length, totalMeals); // 성공률 계산

    // 성공률에 따라 결과를 설정
    const result = successRate >= 90 ? 'good' : successRate > 0 ? 'soso' : 'bad'; 
    await logMealSuccess(userId, mealData[0].id, result); // 성공률 결과를 로그로 저장
    return result; // 성공률 결과 반환
};

// 성공률 조회 함수 (GET 요청)
const getSuccessRate = async (req, res) => {
    const { userId, weekStartDate } = req.query; // 요청 쿼리에서 userId와 주의 시작 날짜 추출
    if (!userId || !weekStartDate) { // 필수 파라미터 체크
        return res.status(400).json({ error: 'userId와 weekStartDate는 필수입니다.' });
    }

    try {
        const mealData = await getMealData(userId, weekStartDate); // 식단 데이터 가져오기
        if (!mealData) return res.status(404).json({ error: '식단 데이터를 찾을 수 없습니다.' });

        const totalMeals = mealData.length; // 총 식단 수 계산
        const successfulMeals = mealData.filter(meal => meal.success).length; // 성공한 식단 수 계산
        const successRate = calculateRate(successfulMeals, totalMeals); // 성공률 계산

        res.status(200).json({ successRate }); // 성공률 응답 반환
    } catch (error) {
        console.error('성공률 조회 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
};

// 성공률 계산 및 로깅 함수 (POST 요청)
const logSuccessRate = async (req, res) => {
    const { userId, weekStartDate, images } = req.body; // 요청 본문에서 userId, 주의 시작 날짜, images 추출
    if (!userId || !weekStartDate || !Array.isArray(images)) { // 필수 파라미터와 배열 형식 체크
        return res.status(400).json({ error: 'userId, weekStartDate, images 배열은 필수입니다.' });
    }

    try {
        const result = await calculateAndLogSuccessRate(userId, weekStartDate, images); // 성공률 계산
        res.status(200).json({ successRate: result }); // 계산된 성공률 응답 반환
    } catch (error) {
        console.error('성공률 계산 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
};

module.exports = {
    getSuccessRate,
    logSuccessRate,
};