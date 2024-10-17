const express = require('express'); // express 모듈 가져오기
const { 
    getFridgeIngredients, 
    addFridgeIngredient, 
    updateFridgeIngredient, 
    deleteFridgeIngredient 
} = require('../controllers/fridgeC'); // 컨트롤러에서 냉장고 관련 함수 가져오기

const router = express.Router(); // 새로운 라우터 객체 생성

// 냉장고 재료 조회 라우트
router.get('/:userId', getFridgeIngredients); // GET 요청 시 재료 조회 처리

// 냉장고 재료 추가 라우트
router.post('/', addFridgeIngredient); // POST 요청 시 재료 추가 처리

// 냉장고 재료 수정 라우트
router.put('/', updateFridgeIngredient); // PUT 요청 시 재료 수정 처리

// 냉장고 재료 삭제 라우트
router.delete('/:userId/:ingredient_name', deleteFridgeIngredient); // DELETE 요청 시 재료 삭제 처리

module.exports = router; // 라우터 모듈 내보내기