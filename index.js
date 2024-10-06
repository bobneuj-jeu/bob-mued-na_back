import express from "express"; // Express를 사용하기 위해 import
import fetch from "node-fetch"; // 외부 API 요청을 위한 모듈 import
import OpenAI from "openai"; // OpenAI API를 사용하기 위한 라이브러리 import
import dotenv from "dotenv"; // 환경 변수 파일(.env)을 읽기 위한 모듈 import
import cors from "cors"; // CORS 문제 해결을 위한 모듈 import

dotenv.config(); // .env 파일에서 환경 변수를 불러오는 코드
const openai = new OpenAI({ apiKey: process.env.OPENAI_API }); // OpenAI API 객체 생성

const app = express(); // Express 애플리케이션 생성
const port = 3000; // 서버 포트 번호 설정

app.use(express.json()); // JSON 요청을 처리하도록 Express에 설정

// CORS 설정
const corsOptions = {
    origin: "http://localhost:4321", // 허용할 도메인
    optionsSuccessStatus: 200, // 오래된 브라우저에서의 오류 방지
};
app.use(cors(corsOptions)); // CORS 설정을 Express에 적용

// 링크 정보를 저장할 객체
let link = {};

// OpenAI API를 통해 식단을 생성하는 함수
async function generateMealPlan(plan, shareID) {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `
                너는 질환을 고려해서 식단을 짜주는 도우미야. 사용자는 너에게 알러지(allergy), 당뇨(diabetes), 기타질환(anythingElse)의 정보를 줄거야.
                너는 JSON으로 전달해야하고 최대한 질병을 고려하면서 맛있는 음식들을 겹치지 않게 만들어주고 응답도 JSON으로 해야 해.
                예시 응답 : [
                    { "아침": ["현미밥", "미역국", "두부조림", "사과 1/2개"] },
                    { "점심": ["비빔국수", "김치", "달걀말이", "딸기 5~6개"] },
                    { "저녁": ["냉면", "오이채무침", "포도 10알"] }
                ]
                `,
            },
            {
                role: "user",
                content: JSON.stringify(plan), // 사용자 입력으로 계획을 전달
            },
        ],
        model: "gpt-3.5-turbo", // 사용하는 OpenAI 모델 버전
    });

    // OpenAI로부터 받은 계획을 링크 객체에 저장
    const response = JSON.parse(completion.choices[0].message.content);
    link[shareID].plans.push({
        name: "result",
        data: response,
    });
}

// API 경로 설정
app.post("/api/submitPlan", async (req, res) => {
    const { shareID, allergy, diabetes, anythingElse, dateNot, people } = req.body;

    // 링크 정보가 존재하지 않으면 생성
    if (!link[shareID]) {
        link[shareID] = {
            allergy: allergy || [],
            diabetes: diabetes || "없음",
            anythingElse: anythingElse || [],
            dateNot: dateNot || null,
            plans: [], // 계획을 저장할 배열
            people: people || 1, // 예상 인원 수
        };
    }

    // 식단 생성 요청
    await generateMealPlan(link[shareID], shareID);
    res.json({ message: "Plan submitted" });
});

// 서버를 포트 3000에서 실행
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); // 서버 실행 로그
});