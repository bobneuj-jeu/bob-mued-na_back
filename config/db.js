const mariadb = require('mariadb');
const express = require('express');
require('dotenv').config();

const { Sequelize } = require('sequelize'); 

// Sequelize 인스턴스 생성 (DB 연결)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb',  // 사용 중인 DBMS에 맞게 설정
  pool: {
    max: 5,  // 최대 연결 수
    min: 0,
    acquire: 10000,
    idle: 10000
  }
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