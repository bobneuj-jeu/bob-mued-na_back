const express = require('express');
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs'); // 비밀번호 해시화를 위한 bcrypt 모듈
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'user', // MariaDB 사용자 이름
    password: '', // MariaDB 비밀번호
    database: 'food_planner', // 사용할 데이터베이스 이름
});

// 데이터베이스 연결
db.connect(err => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err);
        return;
    }
    console.log('데이터베이스에 연결되었습니다.');
});

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true })); // URL 인코딩된 본문을 해석
app.use(session({
    secret: 'yourSecretKey', // 세션 보안 키
    resave: false,
    saveUninitialized: true,
}));

// 로그인 페이지 라우트
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // 기본 로그인 페이지 제공
});

// 사용자 등록 API
app.post('/user/signup', async (req, res) => {
    const { userId, password, allergy, diabetes, AntingElse } = req.body;

    // userId 길이 체크
    if (!userId || userId.length > 12) {
        return res.status(400).json({ success: false, state: '아이디는 최대 12자까지 가능합니다.' });
    }

    // 당뇨 선택지 확인 (5개의 선택지 중 하나)
    const diabetesOptions = ['none', 'type1', 'type2', 'gestational', 'prediabetes'];
    if (!diabetes || !diabetesOptions.includes(diabetes)) {
        return res.status(400).json({ success: false, state: '올바른 당뇨 옵션을 선택하세요.' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO users (userId, password, allergy, diabetes, AntingElse) 
        VALUES (?, ?, ?, ?, ?)
    `;

    let conn;
    try {
        conn = await pool.getConnection(); // 데이터베이스 연결
        await conn.query(query, [userId, hashedPassword, allergy, diabetes, AntingElse]); // 해시화된 비밀번호로 사용자 등록
        res.json({ success: true }); // 성공 응답
    } catch (err) {
        console.error('데이터 삽입 중 오류 발생:', err);
        return res.status(500).json({ success: false, state: '데이터 삽입 중 오류 발생' });
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
});

// 로그인 API
app.post('/user/login', async (req, res) => {
    const { userId, password } = req.body;

    // 사용자 정보 검색 쿼리
    const query = 'SELECT allergy, diabetes, AntingElse, password FROM users WHERE userId = ?';

    let conn;
    try {
        conn = await pool.getConnection(); // 데이터베이스 연결
        const users = await conn.query(query, [userId]); // 사용자 정보 조회
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, state: '로그인 실패: 사용자 아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 확인
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password); // 해시된 비밀번호 비교

        if (!passwordMatch) {
            return res.status(404).json({ success: false, state: '로그인 실패: 사용자 아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 성공적으로 로그인 시 사용자 정보 반환
        res.json({
            success: true,
            message: "로그인 성공",
            data: {
                allergy: user.allergy,
                diabetes: user.diabetes,
                AntingElse: user.AntingElse
            } // 사용자 정보를 포함
        });
    } catch (err) {
        console.error('로그인 중 오류 발생:', err);
        return res.status(500).json({ success: false, state: '로그인 중 오류 발생' });
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT} 실행`);
});