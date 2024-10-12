const pool = require('../config/db'); // DB 연결 설정 가져오기

// 냉장고 재료 목록 조회
exports.getFridgeIngredients = async (req, res) => {
    const { user_id } = req.params; // URL 매개변수에서 사용자 ID 가져오기

    const query = 'SELECT * FROM fridge_ingredients WHERE user_id = ?'; // 재료 조회 쿼리
    let conn;
    try {
        conn = await pool.getConnection(); // DB 연결
        const [results] = await conn.query(query, [user_id]); // 재료 조회 실행

        if (results.length === 0) {
            return res.status(404).json({ error: '해당 사용자에 대한 재료가 없습니다.' }); // 재료가 없으면 404 오류
        }

        res.json({ success: true, data: results }); // 성공 시 데이터 전송
    } catch (err) {
        console.error('재료 조회 중 오류 발생:', err); // 오류 로그 출력
        res.status(500).json({ error: '재료 데이터를 가져오는 중 오류 발생' }); // 오류 메시지 전송
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
};

// 냉장고 재료 추가
exports.addFridgeIngredient = async (req, res) => {
    const { user_id, ingredient_name, quantity } = req.body; // 요청에서 사용자 ID, 재료명, 수량 가져오기

    const query = 'INSERT INTO fridge_ingredients (user_id, ingredient_name, quantity) VALUES (?, ?, ?)';
    try {
        await pool.query(query, [user_id, ingredient_name, quantity]); // 재료 추가
        res.json({ success: true, message: '재료가 추가되었습니다.' }); // 성공 메시지 전송
    } catch (err) {
        console.error('재료 추가 중 오류 발생:', err); // 오류 로그 출력
        res.status(500).json({ error: '재료 추가 중 오류 발생' }); // 오류 메시지 전송
    }
};

// 냉장고 재료 수정
exports.updateFridgeIngredient = async (req, res) => {
    const { user_id, ingredient_name, quantity } = req.body; // 요청에서 사용자 ID, 재료명, 수량 가져오기

    const query = `
        UPDATE fridge_ingredients 
        SET quantity = ? 
        WHERE user_id = ? AND ingredient_name = ?
    `;
    try {
        const [result] = await pool.query(query, [quantity, user_id, ingredient_name]); // 재료 수량 수정
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '해당 재료가 없습니다.' }); // 수정할 재료가 없으면 404 오류
        }
        res.json({ success: true, message: '재료가 수정되었습니다.' }); // 성공 메시지 전송
    } catch (err) {
        console.error('재료 수정 중 오류 발생:', err); // 오류 로그 출력
        res.status(500).json({ error: '재료 수정 중 오류 발생' }); // 오류 메시지 전송
    }
};

// 냉장고 재료 삭제
exports.deleteFridgeIngredient = async (req, res) => {
    const { user_id, ingredient_name } = req.params; // URL 매개변수에서 사용자 ID와 재료명 가져오기

    const query = 'DELETE FROM fridge_ingredients WHERE user_id = ? AND ingredient_name = ?'; // 재료 삭제 쿼리
    try {
        const [result] = await pool.query(query, [user_id, ingredient_name]); // 재료 삭제
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '해당 재료가 없습니다.' }); // 삭제할 재료가 없으면 404 오류
        }
        res.json({ success: true, message: '재료가 삭제되었습니다.' }); // 성공 메시지 전송
    } catch (err) {
        console.error('재료 삭제 중 오류 발생:', err); // 오류 로그 출력
        res.status(500).json({ error: '재료 삭제 중 오류 발생' }); // 오류 메시지 전송
    }
};