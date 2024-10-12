const express = require('express'); // express 모듈 가져오기
const { getMealPlan, saveMealPlan } = require('../controllers/mealC'); // 컨트롤러에서 식단 관련 함수 가져오기

const router = express.Router(); // 새로운 라우터 객체 생성

// 식단 조회 라우트
router.get('/:userId', getMealPlan); // GET 요청 시 식단 조회 처리
// 식단 저장 라우트
router.put('/:userId', saveMealPlan); // PUT 요청 시 식단 생성 또는 수정 처리

module.exports = router; // 라우터 모듈 내보내기