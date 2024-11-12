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

pool.getConnection()
  .then(conn => {
    console.log('Database 연결 성공');
    conn.release();
  })
  .catch(error => {
    console.error('Database 연결 실패:', error.message);
  });

module.exports = pool;