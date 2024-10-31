const db = require('../database/db');

// 냉장고 재료 추가
async function addFridgeItem(username, itemName) {
  return new Promise(async (resolve, reject) => {
    const query = 'INSERT INTO fridge_items (username, itemName) VALUES (?, ?)';
    const values = [username, itemName];

    try {
      const [results] = await db.query(query, values);
      resolve(results);
    } catch (err) {
      reject(err);
    }
  });
}

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

// 냉장고 재료 수정
const updateFridgeItem = (itemId, item) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE fridge_items SET item = ? WHERE id = ?';
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
    const query = 'DELETE FROM fridge_items WHERE id = ?';
    db.query(query, [itemId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = { addFridgeItem, getFridgeItemsByUser, updateFridgeItem, deleteFridgeItem };

