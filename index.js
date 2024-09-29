import express from "express"; // Express 서버를 사용하기 위해 import
import { handler as ssrHandler } from "./dist/server/entry.mjs"; // 서버 사이드 렌더링용 파일 import
import fetch from "node-fetch"; // 외부 API 요청을 하기 위한 모듈 import
import OpenAI from "openai"; // OpenAI API를 사용하기 위한 라이브러리 import
import dotenv from "dotenv"; // 환경 변수 파일(.env)을 읽기 위한 모듈 import
import cors from "cors"; // CORS 문제 해결을 위한 모듈 import

dotenv.config(); // .env 파일에서 환경 변수를 불러오는 코드
console.log(process.env.OPENAI_API); // 환경 변수로 설정된 OpenAI API 키를 콘솔에 출력

const openai = new OpenAI({ apiKey: process.env.OPENAI_API }); // OpenAI API 객체를 생성 (API 키 사용)

const app = express(); // Express 애플리케이션 생성
const port = 3000; // 서버 포트 번호를 3000번으로 설정

app.use(express.json({ extended: true })); // JSON 요청을 처리하도록 Express에 설정

// CORS 설정: 외부에서 서버에 요청을 보낼 때 도메인이 다르면 문제가 생길 수 있는데, 이를 해결하기 위한 설정
const corsOptions = {
    origin: "http://localhost:4321", // 이 도메인에서 온 요청만 허용
    optionsSuccessStatus: 200, // 일부 오래된 브라우저에서의 오류를 방지
};
app.use(cors(corsOptions)); // CORS 설정을 Express에 적용

// 링크 정보를 저장할 객체 (데이터베이스처럼 사용)
let link = {
    "1b0tb": { 
        allergy: [],
        diabetes: "없음",
        anythingElse: [],
        day: 7,
        dateNot: "월요일", // 식단 작성 제외일 (예시로 '월요일' 추가)
        plans: [], // 계획 저장 배열 추가
        people: 3 // 예상 인원 수 (예시)
    },
};

// OpenAI API를 통해 식단을 생성하는 함수
async function main(plan, shareID) {
    plan.dateNot = null; // 날짜 초기화
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system", 
                content: `
                너는 질환을 고려해서 식단을 짜주는 도우미야. 사용자는 너에게 알러지(allergy), 당뇨(diabetes), 기타질환(anythingElse)의 정보를 줄거야
                너는 JOSN으로 전달해야하고 최대한 질병을 고려하면서 맛있는 음식들을 겹치지않게 만들어주고 응답도 JOSN으로 해야해.
                또한 음식의 메뉴는 무조건 밥과 국이거나 면 중 하나, 반찬 3개이상, 디저트도 1~2개 랜덤으로 추천하고 예상 칼로리도 적어줘(단, 예상 칼로리는 1000kcal 이하일 것)
                너를 위해 예시를 들어줄게. 만약 알러지가 토마토, 우유이고, 당뇨와 기타질환은 없다면 너는 이런식으로 작성해줘.
                예시 응답 : [
                    {
                        // 아침
                        현미밥
                        미역국
                        두부조림
                        시금치나물
                        오이무침
                        사과 1/2개
                        미숫가루 음료 (우유 대신 물 사용)
                        예상 칼로리: 850kcal
                    }, 
                    {
                        // 점심
                        비빔국수
                        김치 (무김치)
                        달걀말이
                        콩나물무침
                        딸기 5~6개
                        예상 칼로리: 900kcal
                    },
                    {
                        // 저녁
                        냉면
                        오이채무침,
                        연두부
                        묵무침
                        포도 10알
                        예상 칼로리: 900kcal
                    },
                    {
                        // 아침
                        김치볶음밥
                        치커리샐러드
                        연근조림
                        오징어젓갈
                        배 1/2개
                        예상 칼로리: 930kcal
                    },
                ]
                ` ,
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
    console.log(link[shareID].plans[link[shareID].plans.length - 1]); // 계획을 콘솔에 출력
}

// 기본 경로로 dist 폴더의 파일을 사용
const base = "/";
app.use(base, express.static("dist/client/"));
app.use(ssrHandler); // 서버사이드 렌더링 처리

// 저장된 링크 정보를 가져오는 API
app.get("/api/getLink", (req, res) => {
    console.log("getLink");
    const url = req.query.url;
    if (link[url]) { // 링크가 존재하면 그 정보를 응답
        res.json(link[url]);
    } else { // 링크가 없으면 에러 메시지 응답
        res.json({ message: "Link not found" });
    }
});

// 정보를 요청하는 API (식품 안전 데이터를 받아오는 함수)
app.get("/api/foodsafety", async (req, res) => {
    console.log("Fetching Food Safety Data");

    const startIdx = req.query.startIdx || 1; // 요청 시작 인덱스, 기본값 1
    const endIdx = req.query.endIdx || 10; // 요청 끝 인덱스, 기본값 10
    const dataType = req.query.dataType || "json"; // 요청 데이터 타입, 기본값 'json'
    
    const keyId = "yourKeyId"; // API 키
    const serviceId = "yourServiceId"; // 서비스 ID
    
    const cacheKey = `${keyId}-${serviceId}-${startIdx}-${endIdx}`;
    let data = cache.get(cacheKey); // 캐시에서 데이터 확인
    
    if (!data) {
        try {
            const request = await fetch(
                `http://openapi.foodsafetykorea.go.kr/api/${keyId}/${serviceId}/${dataType}/${startIdx}/${endIdx}`
            );
            data = await request.json(); // API에서 데이터 받아옴
            
            // 데이터가 비어있는지 확인
            if (!data || Object.keys(data).length === 0) {
                res.status(404).json({ message: "No data found" }); // 데이터가 없으면 404 응답
                return;
            }

            cache.set(cacheKey, data); // 캐시에 데이터 저장
            console.log("Data fetched and stored in cache");
        } catch (error) {
            console.error("Error fetching data:", error);
            res.status(500).json({ message: "Internal Server Error" }); // 오류 시 500 응답
            return;
        }
    } else {
        console.log("Cache hit. Data already exists.");
    }

    res.header("Cache-Control", "max-age=2592000000"); // 데이터 캐시 설정
    res.json(data); // 응답으로 데이터 반환
});

// 사용자가 식단을 제출하는 API
app.post("/api/submitPlan", (req, res) => {
    console.log("submitPlan");

    link[req.body.shareID].plans.push({
        allergy: req.body.allergy, // 사용자의 알러지 내용
        diabetes: req.body.diabetes, // 사용자 당뇨 정보
        anythingElse: req.body.anythingElse, // 사용자 기타질환
        dateNot: req.body.dateNot, // 주중 제외 식단
    });
    res.json({ message: "Plan submitted" });
    console.log(link[req.body.shareID]);
    if (link[req.body.shareID].people == link[req.body.shareID].plans.length) {
        console.log("all plans submitted");
        // 모든 식단이 제출되었으면 OpenAI로 식단을 요청
        main(link[req.body.shareID], req.body.shareID);
    }
});

// AI 작성 식단 수정
let mealPlan = [];

// 식단을 화면에 보여주는 함수
function displayMealPlan() {
    let mealPlanElement = document.getElementById("meal-plan"); // HTML에서 id가 'meal-plan'인 요소를 찾아 표시
    mealPlanElement.innerHTML = mealPlan.join(", "); // 리스트 문자열 변환 및 표시
}

// 입력받은 식단을 수정하는 함수
function editMealPlan() {
    let newMeal = prompt("식단을 수정하세요 (현재: " + mealPlan.join(", ") + ")"); // 현재 식단 표시 및 새로운 식단 입력

    if (newMeal) { // 사용자 입력 시
        mealPlan = newMeal.split(",").map(item => item.trim()); // 입력받은 값을 쉼표로 나누어 배열로 변환
        displayMealPlan(); // 새로운 식단 표시
    }
}

window.onload = function() { // 페이지가 로드될 때 AI가 작성한 기본 식단을 보여줌
    displayMealPlan();
};

// 서버를 포트 3000에서 실행
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

