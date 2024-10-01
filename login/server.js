const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
}));

// 로그인 페이지 라우트
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// 회원 가입 라우트
app.post('/signup', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashedPassword };

    db.query('INSERT INTO users SET ?', user, (err, results) => {
        if (err) {
            return res.send('회원가입 실패: ' + err.message);
        }
        res.send('회원가입 완료!');
    });
});

// 로그인 라우트
app.post('/login', (req, res) => {
    db.query('SELECT * FROM users WHERE username = ?', [req.body.username], async (err, results) => {
        if (err) {
            return res.send('로그인 실패: ' + err.message);
        }
        if (results.length > 0) {
            const user = results[0];
            if (await bcrypt.compare(req.body.password, user.password)) {
                req.session.userId = user.id; // 세션에 사용자 ID 저장
                return res.send('로그인 성공!');
            }
        }
        res.send('아이디 또는 비밀번호가 잘못되었습니다.');
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT} 실행`);
});