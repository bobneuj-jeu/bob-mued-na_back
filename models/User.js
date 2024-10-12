const pool = require('../config/db'); // DB 연결 설정 가져오기

class User {
    static async create(userId, password) {
        const query = 'INSERT INTO users (userId, password) VALUES (?, ?)';
        return await pool.query(query, [userId, password]); // 사용자 생성
    }

    static async findByUsername(userId) {
        const query = 'SELECT * FROM users WHERE userId = ?';
        const [user] = await pool.query(query, [userId]); // 사용자 조회
        return user;
    }
}

module.exports = User; // User 모델 내보내기