const { OpenAI } = require("openai");
const db = require('../database/db'); // DB 연결

// OpenAI API 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI를 통한 식단 생성 함수
const generateMealPlanAI = async (userId, meal_days, mealPlanDates) => {
  const query = 'SELECT allergies, diabetes, other_conditions FROM users WHERE id = ?';
  const [user] = await db.query(query, [userId]);

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  const userAllergies = user.allergies || 'none';
  const userDiabetes = user.diabetes || 'none';
  const userOtherConditions = user.other_conditions || 'none';

  // OpenAI에 전달할 프롬프트 구성
  const prompt = `
    사용자 ID: ${userId}, 
    알레르기: ${userAllergies}, 
    당뇨 옵션: ${userDiabetes}, 
    기타 질환: ${userOtherConditions}, 
    요청된 요일: ${meal_days.join(', ')}, 
    식단 날짜: ${mealPlanDates.join(', ')}. 
    이 정보를 바탕으로 다음과 같은 형식의 식단을 추천해줘: 
    식단은 매일 겹치지 않게 1주 분량으로 짜줘.
    한국어로 작성해주고 또 예시를 참고하여 음식이름을 부산사투리로 변환한 것이 무조건 1개 이상인 식단을 매일 겹치지 않게 1주 분량으로 짜줘.
    (예 : 전 -> 찌짐, 부추 -> 정구지, 찌개 -> 짜글이) 
    단, 메뉴는 면이나 밥과 면, 반찬 3개 이상, 디저트 1개 이상이여야 해. 
    부산에서 자주 해먹을 수 있는 요리면 더 좋아. 
    그리고 표시되는 이름을 최대한 부산사투리로 이뤄지게 해.
    표시되는 메뉴는 메뉴 이름만 표시되게 해줘.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 모델 선택
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim(); // AI가 생성한 식단 반환
  } catch (error) {
    console.error('AI 식단 생성 오류:', error);
    return '식단 생성 중 오류가 발생했습니다.'; // 오류 메시지 반환
  }
};

module.exports = { generateMealPlanAI };