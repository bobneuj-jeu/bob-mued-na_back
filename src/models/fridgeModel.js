const db = require('../database/db');

// 냉장고 재료 추가
const addFridgeItem = (username, itemName) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO fridge_items (username, itemName) VALUES (?, ?)';
    db.query(query, [username, itemName], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// 냉장고 재료 조회
const getFridgeItemsByUser = (username) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM fridge_items WHERE username = ?';
    db.query(query, [username], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// 냉장고 재료 삭제
const deleteFridgeItem = (itemName => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM fridge_items WHERE itemName = ?';
    db.query(query, [itemName], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
});

module.exports = { addFridgeItem, getFridgeItemsByUser,  deleteFridgeItem };