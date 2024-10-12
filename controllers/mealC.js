const pool = require('../config/db'); // DB 연결 설정 가져오기

// 식단 조회
exports.getMealPlan = async (req, res) => {
    const { userId } = req.params; // URL 매개변수에서 사용자 ID 가져오기

    const query = 'SELECT date, time, mealPlan FROM mealPlans WHERE userId = ?'; // 식단 조회 쿼리
    let conn;
    try {
        conn = await pool.getConnection(); // DB 연결
        const results = await conn.query(query, [userId]); // 식단 조회 실행

        if (results.length === 0) {
            return res.status(404).json({ error: '해당 사용자에 대한 식단이 없습니다.' }); // 식단이 없으면 404 오류
        }

        res.json({ success: true, data: results }); // 성공 시 데이터 전송
    } catch (err) {
        console.error('식단 조회 중 오류 발생:', err); // 오류 로그 출력
        res.status(500).json({ error: '식단 데이터를 가져오는 중 오류 발생' }); // 오류 메시지 전송
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
};

// 식단 생성 또는 수정
exports.saveMealPlan = async (req, res) => {
    const { userId, mealPlan, successRate } = req.body; // 요청에서 사용자 ID, 식단, 성공률 가져오기

    if (!Array.isArray(mealPlan) || mealPlan.length === 0) {
        return res.status(400).json({ success: false, error: '식단 리스트가 필요합니다.' }); // 식단 리스트가 없으면 400 오류
    }

    const selectQuery = 'SELECT * FROM mealPlans WHERE userId = ?'; // 기존 식단 조회 쿼리
    let conn;
    try {
        conn = await pool.getConnection(); // DB 연결
        const existingMealPlan = await conn.query(selectQuery, [userId]); // 기존 식단 조회

        if (existingMealPlan.length > 0) {
            // 기존 식단이 있는 경우 수정
            const updateQuery = `
                UPDATE mealPlans 
                SET mealPlan = ?, successRate = ?, date = NOW() 
                WHERE userId = ?
            `;
            await conn.query(updateQuery, [JSON.stringify(mealPlan), successRate, userId]); // 식단 수정
        } else {
            // 기존 식단이 없는 경우 삽입
            const insertQuery = `
                INSERT INTO mealPlans (userId, mealPlan, successRate, date) 
                VALUES (?, ?, ?, NOW())
            `;
            await conn.query(insertQuery, [userId, JSON.stringify(mealPlan), successRate]); // 식단 삽입
        }

        // 재료 수량 제외
        for (const ingredient of mealPlan) {
            const updateFridgeQuery = `
                UPDATE fridge_ingredients 
                SET quantity = quantity - 1 
                WHERE name = ? AND userId = ?
            `;
            await conn.query(updateFridgeQuery, [ingredient, userId]); // 냉장고 재료 수량 감소
        }

        res.json({ success: true, message: '식단이 저장되었습니다.' }); // 성공 메시지 전송
    } catch (err) {
        console.error('식단 저장 중 오류 발생:', err); // 오류 로그 출력
        res.status(500).json({ error: '식단 저장 중 오류 발생' }); // 오류 메시지 전송
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
};