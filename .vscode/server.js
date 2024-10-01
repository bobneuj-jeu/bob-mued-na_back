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
    const query = 'SELECT day, contents_title FROM menu'; // menu 테이블에서 day와 contents_title 선택

    let conn;
    try {
        conn = await pool.getConnection();
        const results = await conn.query(query);
        res.json(results); // 쿼리 결과를 JSON 형식으로 응답
    } catch (err) {
        console.error('쿼리 실행 중 오류 발생:', err);
        return res.status(500).json({ error: '데이터를 가져오는 중 오류 발생' });
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
});

// 메뉴 데이터를 삽입하는 API 엔드포인트
app.post('/api/menu', async (req, res) => {
    const { day, contents_title } = req.body; // 요청 본문에서 day와 contents_title 추출
    const query = 'INSERT INTO menu (day, contents_title) VALUES (?, ?)'; // 메뉴 데이터 삽입 쿼리

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(query, [day, contents_title]);
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
    const { userId } = req.body; // 클라이언트 요청에서 사용자 ID 추출
    const { timeFrame, targetCalories, diet } = req.body;  // 클라이언트 요청에서 필요한 데이터 추출

    try {
        // 데이터베이스에서 사용자 정보를 가져오기
        const query = 'SELECT allergy, diabetes, AntingElse FROM users WHERE id = ?'; // 사용자 정보 쿼리
        let conn = await pool.getConnection();
        const user = await conn.query(query, [userId]);
        
        if (user.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const { allergy, diabetes, AntingElse} = user[0];

        // 주의할 재료 목록 생성
        const excludeIngredients = [];

        // 알레르기 재료 추가
        if (allergy) {
            excludeIngredients.push(...allergies.split(',')); // 알레르기 재료를 배열로 변환
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
                timeFrame: timeFrame || 'day',  // 하루 또는 주간 식단
                exclude: excludeIngredients.join(','),  // 제외할 재료 리스트를 쉼표로 연결
            }
        });
        res.json(response.data); // API에서 받은 데이터를 클라이언트로 전송
    } catch (error) {
        console.error('식단 생성 중 오류 발생:', error);
        res.status(500).send('식단 생성 중 오류가 발생했습니다.');
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});