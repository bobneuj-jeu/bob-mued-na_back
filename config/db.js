const { Sequelize } = require('sequelize');
require('dotenv').config();  

// Sequelize 인스턴스 생성 (DB 연결)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
    port:process.env.DB_HOST,
    max: 5,    // 최대 연결 수
    min: 0,
    acquire: 10000,
    idle: 10000,
  }
});

// 데이터베이스 연결 테스트
sequelize.authenticate()
  .then(() => {
    console.log('DB 연결 성공');
  })
  .catch(err => {
    console.error('DB 연결 오류: ', err);
  });

module.exports = sequelize;