// 인증된 이미지가 있는지 확인하는 미들웨어
const imgValidationMiddleware = (req, res, next) => {
    const images = req.body.images; // 요청 본문에서 이미지 배열을 가져옴
    if (!images || images.length === 0) {
        return res.status(400).json({ error: '인증 이미지가 필요합니다.' });
    }
    next(); // 이미지가 있는 경우 다음 미들웨어로 진행
};

module.exports = imgValidationMiddleware;