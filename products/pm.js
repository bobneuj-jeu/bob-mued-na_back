// productMiddleware.js

// 제품 요청 유효성 검사 미들웨어
const validateProduct = (req, res, next) => {
    const { name, price } = req.body; // 요청 본문에서 제품 이름과 가격 가져오기
    if (!name || !price) { // 이름과 가격이 없을 경우
        return res.status(400).json({ message: '제품 이름과 가격은 필수입니다.' }); // 오류 메시지 반환
    }
    next(); // 다음 미들웨어로 이동
};

module.exports = {
    validateProduct,
};