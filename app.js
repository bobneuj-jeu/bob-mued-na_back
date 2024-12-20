const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/user');
const mealRoutes = require('./routes/meals');
const fridgeRoutes = require('./routes/fridge');

require('dotenv').config();
app.use(express.json());
app.use(cors());

// 라우트 연결
app.use('/user', authRoutes);
app.use('/meals', mealRoutes);
app.use('/fridge', fridgeRoutes);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('에러 발생:', err.message);
  res.status(500).json({ message: '서버 에러가 발생했습니다.', error: err.message });
});