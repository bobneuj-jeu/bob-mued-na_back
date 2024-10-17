const express = require('express'); // express 모듈 가져오기
const session = require('express-session'); // 세션 관리 모듈 가져오기
const bodyParser = require('body-parser'); // 요청 본문 파싱 모듈 가져오기
const usersRoutes = require('./routes/usersR'); // 인증 라우트 가져오기
const mealRoutes = require('./routes/mealR'); // 식단 라우트 가져오기
const fridgeRoutes = require('./routes/fridgeR'); // 냉장고 라우트 가져오기
const requestLogger = require('./middleware/requestLogger');
const authMiddleware = require('./middleware/auth');
const errorMiddleware = require('./middleware/error');
const successRoutes = require('./routes/successR');

const path = require('path'); // 경로 처리 모듈 가져오기
const cors = require('cors');

const app = express();
app.use(cors()); // 모든 요청에 대해 CORS 허용
const PORT = process.env.PORT || 3000; // 포트 설정

app.use(bodyParser.json()); // JSON 요청 본문 파싱
app.use(bodyParser.urlencoded({ extended: true })); // URL 인코딩된 요청 본문 파싱
require('dotenv').config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // 세션이 수정되지 않은 경우 다시 저장하지 않도록 설정
    saveUninitialized: true, // 초기화되지 않은 세션을 저장하도록 설정
}));
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.use('/api/users', usersRoutes); // 인증 관련 라우트
app.use('/api/meals', mealRoutes); // 식단 관련 라우트
app.use('/api/fridge', fridgeRoutes); // 냉장고 관련 라우트
app.use('/api/meals', successRoutes); // 성공률

app.use(requestLogger);

// 인증이 필요한 라우트에 대해 인증 미들웨어 사용
app.use('/api/protected', authMiddleware);
app.use(errorMiddleware); // 오류 처리 미들웨어 사용

// 서버 시작
app.listen(process.env.PORT, () => {
    console.log(`서버가 ${process.env.PORT}에서 실행 중입니다.`);
});
