const pool = require('../config/db'); // DB 연결 설정 가져오기
const axios = require('axios');

// OpenAI API 키
const OPENAI_API_KEY = 'OPENAI_API'; // 발급받은 API 키로 교체하세요.

// 식단 조회
exports.getMealPlan = async (req, res) => {
    const { userId } = req.params; // URL 매개변수에서 사용자 ID 가져오기

    const query = 'SELECT meal_date, meal_time, menu FROM meal_plans WHERE user_id = ?'; // 식단 조회 쿼리
    let conn;
    try {
        conn = await pool.getConnection(); // DB 연결
        const [results] = await conn.query(query, [userId]); // 식단 조회 실행

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

// AI가 식단을 생성하는 함수
const generateMealPlanFromAI = async (userId, allergy, diabetes, AnythingElse) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // 사용할 모델
            messages: [
                {
                    role: 'user',
                    content: `사용자 ID: ${userId}, 알레르기: ${allergy}, 당뇨 옵션: ${diabetes}, 기타 질환: ${AnythingElse}. 
                    이 정보를 바탕으로 다음과 같은 형식의 식단을 추천해줘: ["비빔밥", "미역국", "호박전", "나물", "장조림", "떡"].`
                }
            ],
            max_tokens: 100 // 응답의 최대 토큰 수 (조정 가능)
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`, // 인증 헤더
                'Content-Type': 'application/json' // JSON 형식으로 요청
            }
        });

        // AI가 생성한 식단을 배열 형식으로 변환
        const mealPlan = JSON.parse(response.data.choices[0].message.content);
        return mealPlan; // 생성된 식단 반환
    } catch (err) {
        console.error('AI 식단 생성 중 오류 발생:', err);
        throw new Error('AI 식단 생성 실패');
    }
};

// 식단 생성 또는 수정
exports.saveMealPlan = async (req, res) => {
    const { userId, allergies, diabetes, AnythingElse, meal_date, meal_time } = req.body; // 요청에서 사용자 ID, 알레르기 및 기타 정보 가져오기

    try {
        const mealPlan = await generateMealPlanFromAI(userId, allergies, diabetes, AnythingElse); // AI로부터 식단 생성 요청

        // 성공적으로 생성된 식단을 데이터베이스에 저장
        const selectQuery = 'SELECT * FROM meal_plans WHERE user_id = ? AND meal_date = ? AND meal_time = ?'; // 기존 식단 조회 쿼리
        let conn;
        conn = await pool.getConnection(); // DB 연결
        const [existingMealPlan] = await conn.query(selectQuery, [userId, meal_date, meal_time]); // 기존 식단 조회

        if (existingMealPlan.length > 0) {
            // 기존 식단이 있는 경우 수정
            const updateQuery = `
                UPDATE meal_plans 
                SET menu = ? 
                WHERE user_id = ? AND meal_date = ? AND meal_time = ?
            `;
            await conn.query(updateQuery, [JSON.stringify(mealPlan), userId, meal_date, meal_time]); // 식단 수정
        } else {
            // 기존 식단이 없는 경우 삽입
            const insertQuery = `
                INSERT INTO meal_plans (user_id, meal_date, meal_time, menu) 
                VALUES (?, ?, ?, ?)
            `;
            await conn.query(insertQuery, [userId, meal_date, meal_time, JSON.stringify(mealPlan)]); // 식단 삽입
        }

        // 재료 수량 제외
        for (const ingredient of mealPlan) {
            const updateFridgeQuery = `
                UPDATE fridge_ingredients 
                SET quantity = quantity - 1 
                WHERE ingredient_name = ? AND user_id = ?
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