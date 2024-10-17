const pool = require('../config/db'); // DB 연결 설정
const axios = require('axios');
const express = require('express');
require('dotenv').config(); // 환경 변수를 로드하기 위해 필요

// AI API 인증키 설정 (환경 변수)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 데이터베이스 연결 및 쿼리 실행을 위한 헬퍼 함수
const executeQuery = async (query, params) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const [results] = await conn.query(query, params);
        return results;
    } catch (error) {
        throw new Error(error.message);
    } finally {
        if (conn) conn.release();
    }
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

        res.status(200).json({ success: true, data: formattedResults });
    } catch (err) {
        console.error('식단 조회 중 오류 발생:', err.message);
        res.status(500).json({ error: '식단 데이터를 가져오는 중 오류 발생' });
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
        console.error('사용자 정보 조회 중 오류 발생:', err.message);
        res.status(500).json({ error: '사용자 정보를 가져오는 중 오류 발생' });
    }
};

// AI 식단 생성
exports.postGenerate = async (req, res) => {
    const { userId, allergy, diabetes, AnythingElse, meal_date, meal_time } = req.body;

    // 입력값 검증
    if (!userId || !allergy || !diabetes || !AnythingElse || !meal_date || !meal_time ) {
        return res.status(400).json({ error: '모든 입력 값을 제공해야 합니다.' });
    }

    try {
        // 현재 날짜 가져오기
        const currentDate = new Date();
        const excludedDates = meal_date.map(date => date); // 제외할 날짜
        let mealPlanDates = [];

        // 7일 동안의 날짜 생성 (제외된 날짜를 고려)
        for (let i = 0; i < 7; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            const formattedDate = nextDate.toISOString().split('T')[0];

            // 제외된 날짜인지 확인
            if (!excludedDates.includes(formattedDate)) {
                mealPlanDates.push(formattedDate);
            }
        }

        // AI 모델에 보낼 프롬프트 생성
        const prompt = `
            사용자 ID: ${userId}, 
            알레르기: ${allergy}, 
            당뇨 옵션: ${diabetes}, 
            기타 질환: ${AnythingElse}, 
            제외할 날짜: ${meal_date.join(', ')}, 
            식사 시간: ${meal_time.join(', ')}. 
            이 정보를 바탕으로 다음과 같은 형식의 식단을 추천해줘: 
            ${mealPlanDates.map(date => `날짜: ${date}`).join('. ')}
            식단은 매일 겹치지 않게 1주 분량으로 짜줘.
            한국어로 작성해주고 또 예시를 참고하여 음식이름을 부산사투리로 변환한 것이 무조건 1개 이상인 식단을 매일 겹치지 않게 1주 분량으로 짜줘.
            (예 : 전 -> 찌짐, 부추 -> 정구지, 찌개 -> 짜글이) 
            단, 메뉴는 면이나 밥과 면, 반찬 3개 이상, 디저트 1개 이상이여야 해. 
            부산에서 자주 해먹을 수 있는 요리면 더 좋아. 
            그리고 표시되는 이름을 최대한 부산사투리로 이뤄지게 해.
            표시되는 메뉴는 메뉴 이름만 표시되게 해줘.
        `;

        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1000,
            n: 1,
            temperature: 1.0,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // 응답에서 텍스트 내용 추출
        const completionText = response.data.choices[0].text.trim();
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
        await db.promise().query(query, [userId, mealPlanDates, meal_time, JSON.stringify(parsedMealPlan)]); // meal_date를 배열로 저장

        // 최종 응답 반환
        return res.status(200).json({ mealPlan: parsedMealPlan });
    } catch (error) {
        console.error('Error fetching data from OpenAI API:', error);
        return res.status(500).json({ error: 'API 호출 중 오류가 발생했습니다.', details: error.message });
    }
};

// 수정된 식단 저장
exports.saveModifiedMealPlan = async (req, res) => {
    const { userId, mealPlan, meal_date, meal_time } = req.body;

    if (!userId || !mealPlan || !meal_date || !meal_time) {
        return res.status(400).json({ error: '모든 입력 값을 제공해야 합니다.' });
    }

    const upsertQuery = `
        INSERT INTO meal_plans (user_id, meal_date, meal_time, menu) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE menu = VALUES(menu)
    `;

    try {
        await executeQuery(upsertQuery, [userId, meal_date, meal_time, JSON.stringify(mealPlan)]);
        res.status(200).json({ success: true, message: '수정된 식단이 저장되었습니다.' });
    } catch (err) {
        console.error('식단 저장 중 오류 발생:', err.message);
        res.status(500).json({ error: '수정된 식단 저장 중 오류 발생' });
    }
};

// 식사 업데이트 로직
exports.updateMeal = async (req, res) => {
    const { userId } = req.params; // URL에서 사용자 ID 추출
    const { meal_date, meal_time, mealData } = req.body; // 요청 본문에서 업데이트할 식사 데이터 추출

    if (!mealData || !meal_date || !meal_time) { // 필요한 데이터가 없으면 오류 반환
        return res.status(400).json({ error: '필수 입력 값이 누락되었습니다.' });
    }

    const query = `
        UPDATE meal_plans 
        SET menu = ?, meal_date = ?, meal_time = ?
        WHERE user_id = ? AND meal_date = ? AND meal_time = ?
    `;

    try {
        const updatedMeal = await executeQuery(query, [JSON.stringify(mealData.menu), meal_date, meal_time, userId, meal_date, meal_time]);
        
        if (updatedMeal.affectedRows === 0) {
            return res.status(404).json({ error: '업데이트할 식사를 찾을 수 없습니다.' });
        }

        res.status(200).json({ message: '식사가 성공적으로 업데이트되었습니다.', updatedMeal: { userId, meal_date, meal_time, menu: mealData.menu } });
    } catch (error) {
        console.error('식사 업데이트 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
};