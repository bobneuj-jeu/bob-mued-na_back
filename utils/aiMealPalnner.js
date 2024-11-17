const axios = require('axios');

// AI를 사용해 식단을 생성하는 유틸리티
exports.generateMealPlan = async (prompt, { allergies, diabetes, preferences, foodList }) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
                model: 'text-davinci-003',
                prompt: `${prompt} 하루 3끼를 구성해주세요. 
                        알레르기: ${allergies || '없음'}, 
                        선호 음식: ${preferences || '없음'}, 
                        허용된 음식: ${foodList.join(', ')}. 
                        각 끼니는 [메인1, 메인2, 반찬1, 반찬2, 반찬3, 후식] 형식으로 반환해주세요.`,
                max_tokens: 200
            },
            {
                headers: {
                    Authorization: `Bearer YOUR_API_KEY` // 실제 API 키 입력
                }
            }
        );

        const generatedText = response.data.choices[0].text.trim();
        const meals = generatedText.split('\n').map(line => line.split(': ')[1]);

        return {
            breakfast: meals[0] ? meals[0].split(', ') : [],
            lunch: meals[1] ? meals[1].split(', ') : [],
            dinner: meals[2] ? meals[2].split(', ') : []
        };
    } catch (error) {
        console.error('AI 요청 오류:', error);
        throw new Error('AI 식단 생성 실패');
    }
};