const express = require('express');
const path = require('path');
const mariadb = require('mariadb'); // Make sure to use mariadb library
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

// 서버를 시작합니다.
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`); // 서버 실행 메시지
});
