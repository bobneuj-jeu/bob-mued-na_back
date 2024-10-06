const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();  // 환경 변수 설정을 위한 dotenv 모듈 불러오기
const mariadb = require('mariadb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // 'public' 폴더에서 정적 파일 제공

// 환경 변수에서 API 키 불러오기 (API 키는 .env 파일에 저장)
const API_KEY = process.env.API_KEY;
const API_URL = 'https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15081072';  // 식단 API 엔드포인트

// MariaDB 연결 설정
const connection = mysql.createConnection({
    host: process.env.DB_HOST, // 호스트
    user: process.env.DB_USER, // 사용자
    password: process.env.DB_PASSWORD, // 비밀번호
    database: process.env.DB_NAME // 데이터베이스 이름
  });
  
// 연결 테스트
connection.connect((err) => {
    if (err) {
      console.error('데이터베이스 연결 실패: ' + err.stack);
      return;
    }
    console.log('데이터베이스에 연결됨: ' + connection.threadId);
  });
  
  module.exports = connection; // 다른 파일에서 사용하기 위해 연결 객체를 내보냄

connectToDatabase();

// 메뉴 데이터를 반환하는 API 엔드포인트 (/menu/{userid})
app.get('/menu/:userid', async (req, res) => {
    const { userid } = req.params; // 경로에서 userid 추출

    // 요청받은 사용자의 모든 식단 정보를 조회하는 쿼리
    const query = `
        SELECT rice, soup, side_dish1, side_dish2, side_dish3, dessert 
        FROM menu 
        WHERE userid = ?
    `;

    let conn;
    try {
        conn = await pool.getConnection(); // 데이터베이스 연결
        const results = await conn.query(query, [userid]); // 사용자 ID에 따른 식단 정보 조회 쿼리 실행

        if (results.length === 0) {
            return res.status(404).json({ error: '해당 사용자에 대한 식단이 없습니다.' }); // 해당 사용자의 식단이 없을 경우
        }

        // 결과를 하나의 리스트로 묶어서 반환
        const mealPlan = results.map(result => [
            result.rice,
            result.soup,
            result.side_dish1,
            result.side_dish2,
            result.side_dish3,
            result.dessert
        ]);

        res.json({ success: true, mealPlan }); // 하나의 리스트로 묶인 식단 정보 응답
    } catch (err) {
        console.error('쿼리 실행 중 오류 발생:', err);
        return res.status(500).json({ error: '식단 데이터를 가져오는 중 오류 발생' });
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
});

// 메뉴 데이터를 삽입하거나 수정하는 API 엔드포인트
app.post('/mealplan/:userid', async (req, res) => {
    const { userId, mealPlan } = req.body; // 클라이언트 요청에서 사용자 ID와 식단 리스트 추출

    // mealPlan이 유효한지 확인
    if (!Array.isArray(mealPlan) || mealPlan.length === 0) {
        return res.status(400).json({ success: false, error: '식단 리스트가 필요합니다.' });
    }

    // 쿼리 작성 (기존 식단이 있는지 확인)
    const selectQuery = 'SELECT * FROM mealPlans WHERE userId = ?'; // 사용자 ID로 기존 식단 조회

    let conn;
    try {
        conn = await pool.getConnection(); // 데이터베이스 연결
        const existingMealPlan = await conn.query(selectQuery, [userId]); // 기존 식단 조회

        if (existingMealPlan.length > 0) {
            // 기존 식단이 있는 경우 수정
            const updateQuery = 'UPDATE mealPlans SET mealPlan = ? WHERE userId = ?'; // 식단 업데이트 쿼리
            await conn.query(updateQuery, [JSON.stringify(mealPlan), userId]);
            return res.json({ success: true, message: '식단이 수정되었습니다.' });
        } else {
            // 기존 식단이 없는 경우 삽입
            const insertQuery = 'INSERT INTO mealPlans (userId, mealPlan) VALUES (?, ?)'; // 식단 삽입 쿼리
            await conn.query(insertQuery, [userId, JSON.stringify(mealPlan)]);
            return res.json({ success: true, message: '식단이 삽입되었습니다.' });
        }
    } catch (err) {
        console.error('데이터 삽입/수정 중 오류 발생:', err);
        return res.status(500).json({ success: false, error: '식단 삽입/수정 중 오류 발생' });
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
});

// 루트 경로에 대한 GET 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'week_diet.html')); // index.html 파일 응답
});

// 식단 생성 API
app.post('/mealplan', (req, res) => {
    const { userId, password, allergy, diabetes, AnythingElse, fridgeIngredients } = req.body;
  
    // 사용자 정보를 확인하는 쿼리 (사용자 인증)
    const userQuery = 'SELECT * FROM user WHERE userId = ? AND password = ?';
    db.query(userQuery, [userId, password], (err, results) => {
      if (err) {
        return res.status(500).json({ error: '서버 오류' });
      }
  
      // 사용자 인증 실패
      if (results.length === 0) {
        return res.status(400).json({ error: '사용자 인증 실패' });
      }
  
      // 식단 생성을 위한 메뉴를 데이터베이스에서 가져오기
      const riceNoodlesQuery = 'SELECT name FROM rice_noodles';
      const soupsQuery = 'SELECT name FROM soups';
      const sideDishesQuery = 'SELECT name FROM side_dishes';
      const dessertsQuery = 'SELECT name FROM desserts';
  
      // 각 테이블에서 메뉴를 가져오는 쿼리 실행
      Promise.all([
        new Promise((resolve, reject) => {
          db.query(riceNoodlesQuery, (err, results) => {
            if (err) return reject(err);
            resolve(results.map(item => item.name));
          });
        }),
        new Promise((resolve, reject) => {
          db.query(soupsQuery, (err, results) => {
            if (err) return reject(err);
            resolve(results.map(item => item.name));
          });
        }),
        new Promise((resolve, reject) => {
          db.query(sideDishesQuery, (err, results) => {
            if (err) return reject(err);
            resolve(results.map(item => item.name));
          });
        }),
        new Promise((resolve, reject) => {
          db.query(dessertsQuery, (err, results) => {
            if (err) return reject(err);
            resolve(results.map(item => item.name));
          });
        })
      ])
      .then(([riceNoodles, soups, sideDishes, desserts]) => {
        // 각 메뉴에서 랜덤으로 선택
        const selectedRiceNoodle = riceNoodles[Math.floor(Math.random() * riceNoodles.length)];
        const selectedSoup = soups[Math.floor(Math.random() * soups.length)];
        const selectedSideDishes = [];
        for (let i = 0; i < 3; i++) {
          selectedSideDishes.push(sideDishes[Math.floor(Math.random() * sideDishes.length)]);
        }
        const selectedDessert = desserts[Math.floor(Math.random() * desserts.length)];
  
        // 최종 식단 배열 생성
        const mealPlan = [selectedRiceNoodle, selectedSoup, ...selectedSideDishes, selectedDessert];
  
        // 식단을 반환
        res.json({
          message: '식단이 성공적으로 생성되었습니다.',
          mealPlan
        });
      })
      .catch(err => {
        console.error('메뉴 조회 중 오류 발생:', err);
        res.status(500).json({ error: '식단 생성 중 오류 발생' });
      });
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});