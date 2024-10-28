const dotenv = require('dotenv'); // dotenv 모듈 임포트
const express = require('express');
const pool = require('../config/db'); // DB 연결 설정
const axios = require('axios');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'config', '.env') });
console.log(process.env.OPENAI_API_KEY); // .env 파일의 OPENAI_API_KEY 값 확인

const app = express();
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

// 데이터베이스 연결 및 쿼리 실행을 위한 헬퍼 함수
const executeQuery = async (query, params) => {
    let conn;
    try {
        conn = await pool.getConnection(); // DB 연결
        const [results] = await conn.query(query, params); // 쿼리 실행
        return results;
    } catch (error) {
        throw new Error(error.message); // 오류 발생 시 메시지 반환
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
};

// 오류 응답 처리 헬퍼 함수
const handleErrorResponse = (res, error, statusCode = 500) => {
    console.error(error); // 오류 콘솔 로그
    return res.status(statusCode).json({ error: error.message }); // 오류 메시지 반환
};

// 식단 조회
exports.getMealPlan = async (req, res) => {
    const { userId } = req.body; // 사용자 ID 가져오기
    if (!userId) {
        return res.status(400).json({ error: '사용자 ID를 제공해야 합니다.' });
    }

    const query = 'SELECT meal_date, meal_time, menu FROM meal_plans WHERE user_id = ?';

    try {
        const results = await executeQuery(query, [userId]);
        if (!results.length) {
            return res.status(404).json({ error: '선택한 날짜에 대한 식단이 없습니다.' });
        }

        // 메뉴를 배열로 변환하여 포맷팅
        const formattedResults = results.map(item => ({
            meal_date: item.meal_date,
            meal_time: item.meal_time,
            menu: item.menu.split(', ').map(menuItem => menuItem.trim())
        }));

        res.status(200).json({ success: true, data: formattedResults }); // 성공적인 응답
    } catch (err) {
        handleErrorResponse(res, err);
    }
};

// 사용자 정보 조회
exports.getUserInfo = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: '사용자 ID를 제공해야 합니다.' });
    }

    const query = 'SELECT allergy, diabetes, Anything_else, meal_date, meal_time FROM user_info WHERE user_id = ?';

    try {
        const results = await executeQuery(query, [userId]);
        if (!results.length) {
            return res.status(404).json({ error: '해당 사용자에 대한 정보가 없습니다.' });
        }

        res.status(200).json({ success: true, data: results[0] });
    } catch (err) {
        handleErrorResponse(res, err);
    }
};

// AI 식단 생성
exports.postGenerate = async (req, res) => {
    const { userId, allergy = 'none', diabetes, AnythingElse = 'none', meal_days } = req.body; // meal_days로 요일 목록 수신

    // 입력값 검증
    if (!userId || !diabetes || !meal_days || !Array.isArray(meal_days) || meal_days.length === 0) {
        return res.status(400).json({ error: '사용자 ID와 식사 요일 목록을 제공해야 합니다.' });
    }

    try {
        // 현재 날짜 가져오기
        const currentDate = new Date();
        const mealPlanDates = []; // 식단 날짜를 저장할 배열

        // 사용자가 요청한 요일을 바탕으로 날짜를 생성
        meal_days.forEach(day => {
            const dayIndex = ['일', '월', '화', '수', '목', '금', '토'].indexOf(day); // 요일을 인덱스로 변환
            if (dayIndex !== -1) {
                const nextDate = new Date(currentDate);
                nextDate.setDate(currentDate.getDate() + ((dayIndex + 7 - currentDate.getDay()) % 7)); // 다음 해당 요일 날짜 계산
                mealPlanDates.push(nextDate.toISOString().split('T')[0]); // YYYY-MM-DD 형식으로 저장
            }
        });

        // AI 모델에 보낼 프롬프트 생성
        const prompt = `
            사용자 ID: ${userId}, 
            알레르기: ${allergy}, 
            당뇨 옵션: ${diabetes}, 
            기타 질환: ${AnythingElse}, 
            요청된 요일: ${meal_days.join(', ')}, 
            식단 날짜: ${mealPlanDates.join(', ')}. 
            이 정보를 바탕으로 다음과 같은 형식의 식단을 추천해줘: 
            식단은 매일 겹치지 않게 1주 분량으로 짜줘.
            한국어로 작성해주고 또 예시를 참고하여 음식이름을 부산사투리로 변환한 것이 무조건 1개 이상인 식단을 매일 겹치지 않게 1주 분량으로 짜줘.
            (예 : 전 -> 찌짐, 부추 -> 정구지, 찌개 -> 짜글이) 
            단, 메뉴는 면이나 밥과 면, 반찬 3개 이상, 디저트 1개 이상이여야 해. 
            부산에서 자주 해먹을 수 있는 요리면 더 좋아. 
            그리고 표시되는 이름을 최대한 부산사투리로 이뤄지게 해.
            표시되는 메뉴는 메뉴 이름만 표시되게 해줘.
        `;

        // OpenAI API 호출
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',  // 또는 'gpt-4' 등
            messages: [{
                role: 'user',
                content: prompt, // 사용자에게 보낼 메시지
            }],
            max_tokens: 3000,
            temperature: 1.0,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });        

        // 응답에서 텍스트 내용 추출
        const completionText = response.data.choices[0].message.content.trim();
        if (!completionText) {
            return res.status(500).json({ error: 'AI의 응답이 유효하지 않습니다.' });
        }

        // JSON 형식으로 변환
        let parsedMealPlan;
        try {
            parsedMealPlan = JSON.parse(completionText);
        } catch (jsonError) {
            return res.status(500).json({ error: '생성된 식단 형식이 올바르지 않습니다.', details: jsonError.message });
        }

        if (!Array.isArray(parsedMealPlan)) {
            return res.status(500).json({ error: '생성된 식단 형식이 올바르지 않습니다.' });
        }

        // 생성된 식단을 MySQL 데이터베이스에 저장
        const query = 'INSERT INTO meal_plans (user_id, meal_date, meal_time, menu) VALUES (?, ?, ?, ?)';
        await executeQuery(query, [userId, JSON.stringify(mealPlanDates), '주간 식단', JSON.stringify(parsedMealPlan)]); // meal_date를 배열로 저장

        // 최종 응답 반환
        return res.status(200).json({ mealPlan: parsedMealPlan });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

// 수정된 식단 저장
exports.saveModifiedMealPlan = async (req, res) => {
    const { userId, mealPlan, meal_days } = req.body; // 요일 목록으로 수정

    if (!userId || !mealPlan || !meal_days || !Array.isArray(meal_days) || meal_days.length === 0) {
        return res.status(400).json({ error: '모든 입력 값을 제공해야 합니다.' });
    }

    const upsertQuery = `
        INSERT INTO meal_plans (user_id, meal_date, meal_time, menu) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE menu = VALUES(menu)
    `;

    try {
        await executeQuery(upsertQuery, [userId, JSON.stringify(meal_days), '주간 식단', JSON.stringify(mealPlan)]);
        res.status(200).json({ success: true, message: '수정된 식단이 저장되었습니다.' });
    } catch (err) {
        handleErrorResponse(res, err);
    }
};

// 식사 업데이트 로직
exports.updateMeal = async (req, res) => {
    const { userId } = req.params; // URL에서 사용자 ID 추출
    const { meal_days, mealData } = req.body; // 요청 본문에서 업데이트할 식사 데이터 추출

    if (!mealData || !meal_days || !Array.isArray(meal_days) || meal_days.length === 0) { // 필요한 데이터가 없으면 오류 반환
        return res.status(400).json({ error: '필수 입력 값이 누락되었습니다.' });
    }

    const query = `
        UPDATE meal_plans 
        SET menu = ?, meal_date = ?
        WHERE user_id = ? AND meal_date IN (?)
    `;

    try {
        const result = await executeQuery(query, [JSON.stringify(mealData), JSON.stringify(meal_days), userId]);
        if (result.affectedRows === 0) { // 업데이트할 데이터가 없으면 오류 반환
            return res.status(404).json({ error: '업데이트할 식사를 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '식사가 성공적으로 업데이트되었습니다.', updatedMeal: { userId, meal_days, menu: mealData } });
    } catch (err) {
        handleErrorResponse(res, err);
    }
};