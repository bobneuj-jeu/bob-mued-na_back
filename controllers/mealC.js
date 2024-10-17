const pool = require('../config/db'); // DB 연결 설정 가져오기
const axios = require('axios');

// OpenAI API 키
const OPENAI_API_KEY = 'OPENAI_API';

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

// AI를 사용하여 식단 생성
const generateMealPlanFromAI = async (userId, allergy, diabetes, anythingElse, excludedDates, mealTime) => {
    // 입력 검증
    if (!userId || !allergy || !diabetes || !anythingElse || !excludedDates || !mealTime) {
        throw new Error('모든 입력 값을 제공해야 합니다.'); // 필수 입력 값 체크
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `사용자 ID: ${userId}, 알레르기: ${allergy}, 당뇨 옵션: ${diabetes}, 기타 질환: ${anythingElse}, 제외할 날짜: ${excludedDates.join(', ')}, 식사 시간: ${mealTime}. 
                    이 정보를 바탕으로 다음과 같은 형식의 식단을 추천해줘: ["1", "2", "3", "4", "5", "6"].
                    또 예시를 참고하여 음식이름을 부산사투리로 변환한 것이 무조건 1개 이상인 식단을 매일 겹치지 않게 1주 분량으로 짜줘.
                    (예 : 전 -> 찌짐, 부추 -> 정구지, 찌개 -> 짜글이) 단, 메뉴는 면이나 밥과 면, 반찬 3개 이상, 디저트 1개 이상이여야 해. 
                    부산에서 자주 해먹을 수 있는 요리면 더 좋아. 그리고 표시되는 이름을 최대한 부산사투리로 이뤄지게 해.
                    표시되는 메뉴는 메뉴 이름만 표시되게 해줘.`
                }
            ],
            max_tokens: 100 // 응답 토큰 수 제한
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`, // API 키 인증
                'Content-Type': 'application/json'
            }
        });

        // 응답 형식 검증
        if (!response.data.choices || response.data.choices.length === 0) {
            throw new Error('AI의 응답이 유효하지 않습니다.'); // 응답 검증
        }

        // AI가 생성한 식단을 배열 형식으로 변환
        const mealPlan = JSON.parse(response.data.choices[0].message.content);
        
        // 반환된 식단 데이터의 형식 검증
        if (!Array.isArray(mealPlan)) {
            throw new Error('생성된 식단 형식이 올바르지 않습니다.'); // 배열 형식 체크
        }

        return mealPlan; // 생성된 식단 반환
    } catch (err) {
        console.error('AI 식단 생성 중 오류 발생:', err); // 오류 로그 출력
        throw new Error('AI 식단 생성 실패'); // 오류 발생 시 메시지
    }
};

// 식단 생성 또는 수정
exports.saveMealPlan = async (req, res) => {
    const { userId, allergies, diabetes, anythingElse, meal_date, meal_time } = req.body; // 요청에서 사용자 ID 및 기타 정보 가져오기

    try {
        // 기존 식단 조회
        const selectQuery = 'SELECT meal_date FROM meal_plans WHERE user_id = ?'; // 기존 식단 조회 쿼리
        let conn;
        conn = await pool.getConnection(); // DB 연결
        const [existingMeals] = await conn.query(selectQuery, [userId]); // 기존 식단 조회

        const excludedDates = existingMeals.map(meal => meal.meal_date); // 기존 식단 날짜 목록

        const mealPlan = await generateMealPlanFromAI(userId, allergies, diabetes, anythingElse, excludedDates, meal_time); // AI로부터 식단 생성 요청

        // 성공적으로 생성된 식단을 데이터베이스에 저장
        const upsertQuery = `
            INSERT INTO meal_plans (user_id, meal_date, meal_time, menu) 
            VALUES (?, ?, ?, ?)
        `;

        // 식단 삽입
        await conn.query(upsertQuery, [userId, meal_date, meal_time, JSON.stringify(mealPlan)]);

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

// 식단 성공률 계산 로직
const calculateSuccessRate = async (userId, date, images) => {
    // 입력받은 인증 이미지가 없을 경우 'bad' 반환
    if (!images || images.length === 0) return 'bad';

    // 특정 날짜의 식단 데이터를 가져오기 위한 SQL 쿼리
    const [mealData] = await pool.query('SELECT * FROM MealPlan WHERE userId = ? AND date = ?', [userId, date]);

    // 식단 시작시간(조식, 중식, 석식)이 각각 선택된 경우를 확인
    const mealTimes = ['breakfast', 'lunch', 'dinner'];
    const selectedMeal = mealTimes.find(time => 
        mealData.some(meal => meal.time === time && meal.selected)
    );

    // 선택된 식사 시간이 있을 경우 'not' 반환
    if (selectedMeal) return 'not';

    // 입력된 이미지 개수에 따라 성공률을 계산하고 평가 기준을 설정
    const totalMeals = mealData.length;
    const imageCount = images.length;

    // 이미지 개수와 전체 식단 개수를 기준으로 성공률 계산
    const successRate = (imageCount / totalMeals) * 100;

    let result;
    if (successRate >= 90) {
        result = 'good'; // 90% 이상 인증된 경우
    } else if (successRate > 0) {
        result = 'soso'; // 1% 이상 90% 미만 인증된 경우
    } else {
        result = 'bad'; // 인증되지 않은 경우
    }

    // DB에 성공률 저장 (meal_logs 테이블에 기록)
    await pool.query(
        'INSERT INTO meal_logs (user_id, meal_plan_id, meal_success) VALUES (?, ?, ?)', 
        [userId, mealData[0].id, result]
    );

    return result; // 성공률에 따른 평가 반환
};