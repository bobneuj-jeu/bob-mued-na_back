const pool = require('../config/db'); // DB 연결 설정 가져오기

class MealPlan {
    static async findByUserId(userId) {
        const query = 'SELECT * FROM mealPlans WHERE userId = ?';
        const results = await pool.query(query, [userId]); // 사용자 식단 조회
        return results;
    }

    static async createOrUpdate(userId, mealPlan, successRate) {
        const existingPlans = await this.findByUserId(userId);
        if (existingPlans.length > 0) {
            const updateQuery = `
                UPDATE mealPlans 
                SET mealPlan = ?, successRate = ?, date = NOW() 
                WHERE userId = ?
            `;
            await pool.query(updateQuery, [JSON.stringify(mealPlan), successRate, userId]); // 식단 수정
        } else {
            const insertQuery = `
                INSERT INTO mealPlans (userId, mealPlan, successRate, date) 
                VALUES (?, ?, ?, NOW())
            `;
            await pool.query(insertQuery, [userId, JSON.stringify(mealPlan), successRate]); // 식단 삽입
        }
    }
}

module.exports = MealPlan; // MealPlan 모델 내보내기