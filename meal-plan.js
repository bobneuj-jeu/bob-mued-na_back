require('dotenv').config();  // .env 파일 불러오기

const axios = require('axios');

// 환경 변수에서 API 키 불러오기
const apiUrl = 'https://api.example.com/meals';
const apiKey = process.env.API_KEY;  // 환경 변수에서 API 키 사용

// 나머지 코드는 동일
async function getMealData() {
    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        throw error;
    }
}

async function main() {
    try {
        const mealData = await getMealData();
        const mealPlan = createMealPlan(mealData);
        console.log('오늘의 식단:', mealPlan);
    } catch (error) {
        console.error('식단 작성 중 오류 발생:', error);
    }
}

main();