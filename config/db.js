const mysql = require('mysql2/promise'); // MySQL2 모듈을 promise 기반으로 가져옴
require('dotenv').config(); // 환경 변수를 사용하기 위해 dotenv 모듈을 불러옴

const pool = mysql.createPool({
    host: process.env.DB_HOST, // 데이터베이스 호스트
    user: process.env.DB_USER, // 데이터베이스 사용자
    password: process.env.DB_PASSWORD, // 데이터베이스 비밀번호
    database: process.env.DB_NAME, // 데이터베이스 이름
    connectionLimit: 5, // 최대 연결 수
});

module.exports = pool; // 생성한 연결 풀을 모듈로 내보냄