const { getMealData, logMealSuccess } = require('../models/success');
const pool = require('../config/db');
const axios = require('axios');

// 성공률 계산 유틸리티 함수
const calculateRate = (successfulCount, totalCount) => {
    if (totalCount === 0) return 0; // 총 식단 수가 0일 때는 성공률을 0으로 반환
    return (successfulCount / totalCount) * 100; // 성공률 계산 (성공한 식단 수 / 총 식단 수) * 100
};

// 식단 성공률 계산 로직
const calculateSuccessRate = async (userId, date, images) => {
    const mealData = await getMealData(userId, date); // 주어진 사용자와 날짜의 식단 데이터 가져오기
    if (!mealData) return 'bad'; // 식단 데이터가 없으면 'bad' 반환

    const hasSelectedMeal = mealData.some(meal => meal.selected); // 선택된 식단이 있는지 확인
    if (hasSelectedMeal) return 'not'; // 선택된 식단이 있을 경우 'not' 반환

    const totalMeals = mealData.length; // 총 식단 수 계산
    const imageCount = images.length; // 업로드된 이미지 수 계산
    const successRate = calculateRate(imageCount, totalMeals); // 성공률 계산

    // 성공률에 따라 결과를 'good', 'soso', 'bad'로 설정
    const result = successRate >= 90 ? 'good' : successRate > 0 ? 'soso' : 'bad'; 
    await logMealSuccess(userId, mealData[0].id, result); // 성공률 결과를 로그로 저장
    return result; // 성공률 결과 반환
};

// 성공률 조회 함수 (GET 요청)
const getSuccessRate = async (req, res) => {
    try {
        const { userId, date } = req.query; // 요청에서 userId와 date를 추출
        if (!userId || !date) { // 필수 파라미터 체크
            return res.status(400).json({ error: 'userId와 date는 필수입니다.' });
        }

        const mealData = await getMealData(userId, date); // 식단 데이터 가져오기
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
    try {
        const { userId, date, images } = req.body; // 요청 본문에서 userId, date, images 추출
        if (!userId || !date || !Array.isArray(images)) { // 필수 파라미터와 배열 형식 체크
            return res.status(400).json({ error: 'userId, date, images 배열은 필수입니다.' });
        }

        const result = await calculateSuccessRate(userId, date, images); // 성공률 계산
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