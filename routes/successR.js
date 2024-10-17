const express = require('express');
const { getSuccessRate } = require('../controllers/mealC');

const router = express.Router();

// 성공률 조회 API 엔드포인트
router.get('/success-rate', async (req, res) => {
    try {
        const { userId, date } = req.query; // 사용자 ID와 날짜를 쿼리 매개변수로 받음
        const images = []; // 실제 코드에서는 업로드된 이미지를 사용

        // 성공률 계산 함수 호출
        const result = await calculateSuccessRate(userId, date, images);

        // 클라이언트에 성공률 결과 반환
        res.status(200).json({ successRate: result });
    } catch (error) {
        // 오류 발생 시 클라이언트에 오류 메시지 반환
        res.status(500).json({ error: '성공률 계산 중 오류가 발생했습니다.' });
    }
});

module.exports = router; // 라우터 모듈 내보내기