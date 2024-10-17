const express = require('express');
const session = require('express-session');
const usersRoutes = require('./routes/usersR');
const mealRoutes = require('./routes/mealR');
const fridgeRoutes = require('./routes/fridgeR');
const successRoutes = require('./routes/successR');
const requestLogger = require('./middleware/requestLogger');
const authMiddleware = require('./middleware/auth');
const errorMiddleware = require('./middleware/error');

const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(requestLogger); // 모든 요청에 대해 로깅
app.use(cors()); // 필요한 경우에만 CORS 허용
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 요청 본문 파싱

app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // 환경 변수 설정
    resave: false,
    saveUninitialized: false, // 필요하지 않은 세션을 저장하지 않도록 설정
}));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.use('/api/users', usersRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/fridge', fridgeRoutes);
app.use('/api/success', successRoutes); // 경로 수정

// 인증이 필요한 라우트 설정
app.use('/api/protected', authMiddleware);

// 오류 처리 미들웨어
app.use(errorMiddleware);

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}에서 실행 중입니다.`);
});
