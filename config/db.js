const { Sequelize } = require('sequelize');
require('dotenv').config();  

// Sequelize 인스턴스 생성 (DB 연결)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb',  // 사용 중인 DBMS에 맞게 설정
  pool: {
    max: 5,    // 최대 연결 수
    min: 0,
    acquire: 10000,
    idle: 10000
  }
});

// 데이터베이스 연결 테스트
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
