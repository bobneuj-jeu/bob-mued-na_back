// config/db.js
const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb',
  pool: {
    max: 5, // 최대 연결 수
    min: 0,
    acquire: 10000, // 연결을 시도하는 최대 시간
    idle: 10000  // 연결이 사용되지 않을 때 풀로 돌아가기까지의 시간
  }
});

pool.getConnection()
  .then(conn => {
    console.log('Database 연결 성공');
    conn.release();
  })
  .catch(error => {
    console.error('Database 연결 실패:', error.message);
  });

module.exports = pool;