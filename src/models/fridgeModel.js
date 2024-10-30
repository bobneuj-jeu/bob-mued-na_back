const db = require('../database/db');

// 냉장고 재료 추가
const addFridgeItem = (userId, item) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO fridge (user_id, item) VALUES (?, ?)';
    db.query(query, [userId, item], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// 냉장고 재료 조회
const getFridgeItemsByUser = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM fridge WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// 냉장고 재료 수정
const updateFridgeItem = (itemId, item) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE fridge SET item = ? WHERE id = ?';
    db.query(query, [item, itemId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// 냉장고 재료 삭제
const deleteFridgeItem = (itemId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM fridge WHERE id = ?';
    db.query(query, [itemId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = { addFridgeItem, getFridgeItemsByUser, updateFridgeItem, deleteFridgeItem };

