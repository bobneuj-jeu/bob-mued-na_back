const express = require('express');
const app = express();
const authRoutes = require('./routes/user');
const mealRoutes = require('./routes/meals');
require('dotenv').config();

// JSON 파싱 미들웨어 설정
app.use(express.json());

// 라우트 연결
app.use('/user', authRoutes);
app.use('/meals', mealRoutes);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('에러 발생:', err.message);
  res.status(500).json({ message: '서버 에러가 발생했습니다.', error: err.message });
});

app.listen(process.env.PORT, () => {
  console.log(`서버가 ${process.env.PORT}번 포트에서 실행 중입니다.`);
});