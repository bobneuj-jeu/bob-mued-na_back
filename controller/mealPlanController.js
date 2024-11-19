require('dotenv').config();
const { OpenAI } = require('openai');
const Meal = require('../models/meal'); // Meal 모델 연결
const User = require('../models/user'); // User 모델 연결

// OpenAI API 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// generateMealPlan 함수 정의
async function generateMealPlan(prompt) {
  try {
    // OpenAI에서 스트리밍 응답을 받음
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // 사용할 모델
      messages: [{ role: 'user', content: prompt }],
      stream: true, // 스트리밍 응답 활성화
    });

    let responseText = '';
    // 스트리밍 데이터를 받아서 responseText에 저장
    for await (const chunk of stream) {
      responseText += chunk.choices[0]?.delta?.content || '';
    }

    return responseText; // 스트리밍 데이터를 모두 받은 후 반환
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw new Error('Failed to generate meal plan');
  }
}

// 식단 생성 함수
exports.createMealPlan = async (req, res) => {
  try {
    const { username, meal_date, meal_time } = req.body;

    // 사용자 정보 조회
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const { allergies, diabetes, anything } = user;

    // 제외할 날짜와 시간 계산
    const remainingDays = DAYS.filter(day => day !== meal_date);
    const diseases = [allergies, diabetes, anything].filter(Boolean).join(', ');

    // OpenAI에 보낼 프롬프트 생성
    const prompt = `
      식단을 작성: ${meal_date}와 ${meal_time}를 제외한 일주일 모든 식단 작성.
      - Include these days: ${remainingDays.join(', ')}.
      - 질환 고려 식단 작성: ${diseases}.
      - 메뉴의 구성은 [메인1, 메인2, 반찬1, 반찬2, 반찬3, 후식]으로 고정.
      - 최대 3개의 식사만 작성.
      - 부산 사투리 사용. (전 -> 지짐, 찌개 -> 짜글이, 부추 -> 정구지)
      - Format the response as JSON:
      {
        "days": [
          {
            "day": "요일명",
            "meals": [
              {
                "time": "시간",
                "menu": {
                  "main1": "...",
                  "main2": "...",
                  "side1": "...",
                  "side2": "...",
                  "side3": "...",
                  "dessert": "..."
                }
              }
            ]
          },
          ...
        ]
      }
    `;

    // OpenAI에서 식단을 스트리밍으로 생성
    const mealPlanResponse = await generateMealPlan(prompt); // 스트리밍 응답을 처리하는 함수 호출

    // 응답을 받았으면 식단 데이터베이스에 저장
    const mealPlans = JSON.parse(mealPlanResponse);

    for (const day of mealPlans.days) {
      let mealCount = 0;
      for (const meal of day.meals) {
        if (mealCount >= 3) break; // 최대 3개의 식사만 저장
        await Meal.create({
          userId: user.id,
          date: day.day,
          time: meal.time,
          menu: JSON.stringify(meal.menu),
        });
        mealCount++;
      }
    }

    // 응답을 한 번만 보내도록 수정
    res.status(201).json({ message: '성공적으로 식단을 생성했습니다.', mealPlans });
  } catch (error) {
    console.error('식단을 만드는 중에 오류가 생겼습니다. :', error);
    // 중복 응답 방지
    if (!res.headersSent) {
      return res.status(500).json({ error: '서버 오류', details: error.message });
    }
  }
};
