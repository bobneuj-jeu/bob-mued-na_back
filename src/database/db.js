const mysql = require('mysql2/promise'); 
require('dotenv').config();

// DB 연결 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 연결 확인 함수
const testConnection = async () => {
  try {
    const connection = await pool.getConnection(); // 커넥션 가져오기
    console.log('데이터베이스에 연결되었습니다.');
    await connection.release(); // 연결 해제
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error); // 오류 발생 시 로그
  }
};

// 연결 테스트 호출
testConnection();

// pool을 내보내기
module.exports = pool; 