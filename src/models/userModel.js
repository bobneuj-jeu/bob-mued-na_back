const db = require('../database/db');

// 사용자 등록
const registerUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// 사용자 로그인
const loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

module.exports = { registerUser, loginUser };