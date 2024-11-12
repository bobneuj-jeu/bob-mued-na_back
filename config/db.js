const mariadb = require('mariadb');
const express = require('express');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize로 데이터베이스 연결 설정
const pool= new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb',
  pool: {
    max: 5, // 최대 연결 수
    min: 0,
    acquire: 10000, // 연결을 시도하는 최대 시간
    idle: 10000  // 연결이 사용되지 않을 때 풀로 돌아가기까지의 시간
  }
});

// 기본 API 엔드포인트 설정
app.get('/', (req, res) => {
  res.send('Hello, this is your backend!');
});

// DB 연결 테스트
pool.authenticate()
  .then(() => {
    console.log('Database 연결 성공');
    conn.release();
  })
  .catch(err => {
    console.error('Database 연결 실패:', error.message);
  });

module.exports = pool;