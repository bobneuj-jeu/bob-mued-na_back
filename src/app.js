const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoute'); // 사용자 라우터
const mealRoutes = require('./routes/mealRoutes'); // 식단 라우터
const fridgeRoutes = require('./routes/fridgeRoutes'); // 냉장고 라우터

const app = express();
require('./database/db'); // DB 연결

app.use(cors());
app.use(bodyParser.json()); // JSON 형식의 요청 본문 파싱
app.use(express.json()); // JSON 본문 파싱 미들웨어 추가

// 라우터 설정
app.use('/users', userRoutes); // 사용자 관련 라우터
app.use('/meals', mealRoutes); // 식단 관련 라우터
app.use('/fridge', fridgeRoutes); // 냉장고 관련 라우터

module.exports = app;

app.use(
  cors({
    origin: [
      "https://port-0-bob-mued-na-back-m2bnagfa9ba03cbe.sel4.cloudtype.app",
      "https://web-bob-mued-na-fe-m2bo9hmmc0a012c5.sel4.cloudtype.app ",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
