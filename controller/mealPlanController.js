const dotenv = require('dotenv');
const { OpenAI } = require('openai'); 
const User = require('../models/user'); // 사용자 정보 가져오는 모듈
const food = require('../models/foodItem'); // 식재료 목록을 가져오는 모듈

dotenv.config();

// OpenAI 인스턴스 생성 (new 사용)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getModelList() {
  try {
    // 사용 가능한 모델 목록을 가져옵니다.
    const models = await openai.models.list();
    console.log('Available models:', models); // 모델 목록 출력
  } catch (error) {
    console.error('Error fetching model list:', error);
  }
}

exports.parseMenu = async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: {
        message: "OpenAI API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.",
      },
    });
  }

  const { username, meal_date, meal_time } = req.body;

  // meal_date와 meal_time이 공백일 경우 '없음'으로 처리
  const mealDate = meal_date?.trim() || '없음';
  const mealTime = meal_time?.trim() || '없음';

  if (!username) {
    return res.status(400).json({
      error: {
        message: "잘못된 입력입니다. 사용자 이름을 입력해주세요.",
      },
    });
  }

  try {
    // 사용자 정보를 가져옵니다.
    const userInfo = await User.findOne({ username });
    if (!userInfo) {
      return res.status(404).json({
        error: {
          message: "사용자를 찾을 수 없습니다.",
        },
      });
    }

    const { allergies, diabetes, anything } = userInfo; // 사용자 알러지, 당뇨, 기타 정보

    // 사용자의 식재료 목록을 가져옵니다.
    const itemname = await food(username);
    if (!itemname || itemname.length === 0) {
      return res.status(404).json({
        error: {
          message: "사용자의 식재료 목록을 찾을 수 없습니다.",
        },
      });
    }

    // 유효한 식재료 목록 필터링 (예시: 빈 문자열, 또는 잘못된 재료 제외)
    const validIngredients = itemname.filter((ingredient) => ingredient.trim() !== "");
    if (validIngredients.length === 0) {
      return res.status(400).json({
        error: {
          message: "유효한 식재료가 없습니다. 제공된 식재료 목록을 확인해주세요.",
        },
      });
    }

    // 프롬프트 생성
    const prompt = generatePrompt(username, mealDate, mealTime, validIngredients, allergies, diabetes, anything);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  
      messages: [{ role: "user", content: prompt }],
    });

    // OpenAI 응답 검증 및 메뉴 파싱
    if (!completion || !completion.data || !completion.data.choices || !completion.data.choices[0].message) {
      throw new Error('OpenAI 응답 형식에 문제가 있습니다.');
    }

    const menu = parseMenu(completion.data.choices[0].message.content);
    return res.status(200).json({ menu });
  } catch (error) {
    console.error("OpenAI API 오류:", error.message);
    return res.status(500).json({
      error: {
        message: `메뉴 생성 중 오류가 발생했습니다: ${error.message}`,
      },
    });
  }
};

function generatePrompt(username, meal_date, meal_time, itemname, allergies, diabetes, anything) {
  const ingredientList = itemname.join(", ");
  const allergyList = allergies ? allergies.join(", ") : "없음";
  const diabetesList = diabetes ? diabetes.join(", ") : "없음";
  const anythingList = anything ? anything.join(", ") : "없음";

  return `
      사용자 이름: ${username}을 기준으로,
      날짜: ${meal_date}, 시간: ${meal_time}을 제외한 1주일간의 식단을 짜라.  
      식단을 짜는 데에 있어서 다음과 같은 조건들을 고려하라:
      - 알러지: ${allergyList}
      - 당뇨 상태: ${diabetesList}
      - 기타 건강 상태: ${anythingList}
      - 하루 최대 3개의 메뉴로 구성
      - 각 메뉴는 반드시 다음과 같은 항목을 포함해야 한다:
        1. 메인1
        2. 메인2
        3. 반찬1
        4. 반찬2
        5. 반찬3
        6. 후식
      - 메뉴의 구성은 부산 사투리로 작성해야 한다. 예를 들어:
        - "전" → "지짐"
        - "찌개" → "짜글이"
        - "부추" → "정구지"
      - 하루 3개 이상의 식사를 포함시키되, 중복되지 않도록 식단을 짜라.

      예시:
      월 조식: [돼지국밥, 생선구이, 정구지무침, 무말랭이, 콩자반, 케이키]
      월 중식: [부대찌개, 고등어구이, 배추김치, 애호박볶음, 콩나물무침, 식혜]
      월 석식: [불고기, 돌솥비빔밥, 깻잎지짐, 시금치나물, 김치, 매실차]
      화 조식: [흑미밥, 김치짜글이, 김치지짐, 도다리, 김치, 커피]
    `;
}

function parseMenu(text) {
  const menus = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("메뉴"))
    .map((menu) => {
      const parts = menu.split(":")[1].split(",");
      return parts.map((item) => item.trim());
    });

  return menus.slice(0, 3); // 최대 3개의 메뉴만 반환
}