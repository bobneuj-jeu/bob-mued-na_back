const db = require('../database/db');

// 식단 추가
const addMeal = (username, mealPlan) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO Meals (user_id, meal_plan) VALUES (?, ?)';
    db.query(query, [username, mealPlan], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// 식단 조회
const getMealsByUser = (username) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM Meals WHERE user_id = ?';
    db.query(query, [username], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// 식단 수정
const updateMeal = (mealId, mealPlan) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE Meals SET meal_plan = ? WHERE id = ?';
    db.query(query, [mealPlan, mealId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// 식단 삭제
const deleteMeal = (mealId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM Meals WHERE id = ?';
    db.query(query, [mealId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = { addMeal, getMealsByUser, updateMeal, deleteMeal };