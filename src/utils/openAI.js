const { OpenAI } = require("openai");
const db = require('../database/db'); // DB 연결

// OpenAI API 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI를 통한 식단 생성 함수
const generateMealPlanAI = async (userId, meal_days, mealPlanDates) => {
  const query = 'SELECT allergies, diabetes, anything FROM users WHERE id = ?';
  const [user] = await db.query(query, [userId]); // userId를 사용하여 데이터베이스 쿼리

  // 사용자 확인 및 속성 추출
  if (!user || user.length === 0) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  const { allergies = 'none', diabetes = 'none', anything = 'none' } = user[0];

  // OpenAI에 전달할 프롬프트 구성
  const prompt = `
    사용자 ID: ${username}, 
    알레르기: ${allergies}, 
    당뇨 옵션: ${diabetes}, 
    기타 질환: ${anything}, 
    식단 날짜: ${meal_time.join(', ')}. 
    이 정보를 바탕으로 다음과 같은 형식의 식단을 추천해줘: 
    식단은 매일 겹치지 않게 1주 분량으로 짜줘. 단, 식단 날짜에 적힌 날은 제외하고 써줘.
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

    // 응답 구조 체크
    if (response.choices && response.choices.length > 0) {
      const mealPlan = response.choices[0].message.content.trim(); // AI가 생성한 식단 반환
      
      const insertQuery = 'INSERT INTO Meals (user_id, meal_date, meal_time, food_item_ids) VALUES ?';
      const mealEntries = [];

      // 생성된 식단을 날짜별로 분리하여 삽입할 형식으로 변환
      const mealLines = mealPlan.split('\n').filter(line => line.trim() !== '');

      mealLines.forEach(line => {
        // 예시로 한 줄에 한 식사를 저장하는 방식 가정
        const [date, mealTime, foodItems] = line.split(':');
        mealEntries.push([userId, date.trim(), mealTime.trim(), JSON.stringify([])]); // 빈 배열로 두기
      });

      // 한 번에 삽입
      await db.query(insertQuery, [mealEntries]);

      return mealPlan; // AI가 생성한 식단 반환
    } else {
      throw new Error('AI 응답에 예상치 못한 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('AI 식단 생성 오류:', error);
    throw new Error('식단 생성 중 오류가 발생했습니다: ' + error.message); // 오류 메시지 반환
  }
};

module.exports = { generateMealPlanAI };