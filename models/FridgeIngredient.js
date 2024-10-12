const pool = require('../config/db'); // DB 연결 설정 가져오기

class FridgeIngredient {
    static async findByUserId(userId) {
        const query = 'SELECT * FROM fridge_ingredients WHERE userId = ?';
        const results = await pool.query(query, [userId]); // 사용자 냉장고 재료 조회
        return results;
    }

    static async add(userId, name, quantity) {
        const query = 'INSERT INTO fridge_ingredients (userId, name, quantity) VALUES (?, ?, ?)';
        await pool.query(query, [userId, name, quantity]); // 재료 추가
    }
}

module.exports = FridgeIngredient; // FridgeIngredient 모델 내보내기