const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();  // 환경 변수 설정을 위한 dotenv 모듈 불러오기
const mariadb = require('mariadb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // 'public' 폴더에서 정적 파일 제공

// CloudType 데이터베이스 연결 설정
const pool = mariadb.createPool({
    host: 'localhost', // CloudType에서 제공하는 호스트 이름
    user: 'user', // CloudType 데이터베이스 사용자 이름
    password: '', // CloudType 데이터베이스 비밀번호
    database: 'food_planner', // CloudType 데이터베이스 이름
    port: 3306, // 기본 MySQL 포트 (필요시 변경)
    connectionLimit: 5 // 커넥션 풀 크기
});

// 데이터베이스 연결
async function connectToDatabase() {
    try {
        const conn = await pool.getConnection();
        console.log('데이터베이스에 연결되었습니다.');
        conn.release(); // 연결 해제
    } catch (err) {
        console.error('데이터베이스 연결 오류:', err);
    }
}

connectToDatabase();

// 메뉴 데이터를 반환하는 API 엔드포인트
app.get('/api/menu', async (req, res) => {
    const { day } = req.query; // 클라이언트에서 날짜 쿼리 파라미터로 받음

    if (!day) {
        return res.status(400).json({ error: '날짜가 필요합니다.' }); // 날짜가 없으면 에러 응답
    }

    // 요청받은 날짜에 맞는 식단 정보를 모두 조회하는 쿼리
    const query = `
        SELECT rice, soup, side_dish, dessert 
        FROM menu 
        WHERE day = ?
    `;

    let conn;
    try {
        conn = await pool.getConnection(); // 데이터베이스 연결
        const results = await conn.query(query, [day]); // 쿼리 실행

        if (results.length === 0) {
            return res.status(404).json({ error: '해당 날짜에 대한 식단이 없습니다.' }); // 해당 날짜의 식단이 없을 경우
        }

        res.json(results); // 조회된 식단 정보를 클라이언트에 JSON 형식으로 응답
    } catch (err) {
        console.error('쿼리 실행 중 오류 발생:', err);
        return res.status(500).json({ error: '식단 데이터를 가져오는 중 오류 발생' });
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
});

// 메뉴 데이터를 삽입하는 API 엔드포인트
app.post('/api/menu', async (req, res) => {
    const { day, rice, soup, side_dishes, dessert } = req.body; // 클라이언트 요청에서 각 식단 요소 추출

    // 반찬이 3개 이상인지 확인
    if (!Array.isArray(side_dishes) || side_dishes.length < 3) {
        return res.status(400).json({ success: false, error: '반찬은 최소 3개 이상이어야 합니다.' });
    }

    const query = `
        INSERT INTO menu (day, rice, soup, side_dish1, side_dish2, side_dish3, dessert) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `; // 반찬을 3개까지 저장할 수 있도록 쿼리 작성

    let conn;
    try {
        conn = await pool.getConnection(); // 데이터베이스 연결

        // 요청받은 데이터를 쿼리에 바인딩하여 삽입
        await conn.query(query, [day, rice, soup, side_dishes[0], side_dishes[1], side_dishes[2], dessert]);

        res.json({ success: true }); // 성공 응답
    } catch (err) {
        console.error('데이터 삽입 중 오류 발생:', err);
        return res.status(500).json({ success: false, error: '데이터 삽입 중 오류 발생' });
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
});

// 루트 경로에 대한 GET 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'week_diet.html')); // index.html 파일 응답
});

// 환경 변수에서 API 키 불러오기 (API 키는 .env 파일에 저장)
const API_KEY = process.env.API_KEY;
const API_URL = 'https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15081072';  // 식단 API 엔드포인트

// 식단 생성 API 엔드포인트
app.post('/api/mealplan', async (req, res) => {
    const { id, password } = req.body; // 클라이언트 요청에서 ID와 비밀번호 추출

    try {
        // ID와 비밀번호로 사용자 정보 검색
        const query = 'SELECT id, allergy, diabetes, AntingElse FROM users WHERE id = ? AND password = ?'; // ID와 비밀번호로 사용자 정보 쿼리
        let conn = await pool.getConnection();
        const user = await conn.query(query, [id, password]);
        
        if (user.length === 0) {
            return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
        }

        const { allergy, diabetes, AntingElse } = user[0];

        // 주의할 재료 목록 생성
        const excludeIngredients = [];

        // 알레르기 재료 추가
        if (allergy) {
            excludeIngredients.push(...allergy.split(',')); // 알레르기 재료를 배열로 변환
        }
        
        // 당뇨 주의 재료 추가
        if (diabetes) {
            excludeIngredients.push('sugar'); // 예시로 'sugar' 추가
        }

        // 기타 질환에 따른 재료 추가
        if (AntingElse) {
            // 기타 질환에 따른 로직 추가 가능
        }

        // 식단 생성 API에 요청을 보내고 응답 받기
        const response = await axios.get(API_URL, {
            params: {
                apiKey: API_KEY,  // API 키
                exclude: excludeIngredients.join(','),  // 제외할 재료 리스트를 쉼표로 연결
            }
        });

        // 반환된 데이터에서 면, 밥, 국, 반찬 3개, 디저트 1개 선택
        const meals = response.data.meals; // 가정: API에서 받은 데이터에 'meals'가 포함됨

        // 각 식단 구성 요소를 추출
        const selectedMealPlan = {
            riceOrNoodle: meals.riceOrNoodle, // 밥이나 면
            soup: meals.soup, // 국
            sideDishes: meals.sideDishes.slice(0, 3), // 반찬 3개
            dessert: meals.dessert // 디저트 1개
        };

        res.json(selectedMealPlan); // 구성된 식단을 클라이언트로 전송
    } catch (error) {
        console.error('식단 생성 중 오류 발생:', error);
        res.status(500).send('식단 생성 중 오류가 발생했습니다.');
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});