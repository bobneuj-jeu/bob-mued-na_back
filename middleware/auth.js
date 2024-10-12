const jwt = require('jsonwebtoken');

// 인증 미들웨어
const authMiddleware = (req, res, next) => {
    // 요청 헤더에서 토큰을 가져옴
    const token = req.headers['authorization'];

    // 토큰이 없으면 401 오류를 반환
    if (!token) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    // 토큰을 검증
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
        }
        // 요청 객체에 사용자 정보를 추가
        req.user = user;
        next(); // 다음 미들웨어로 진행
    });
};

module.exports = authMiddleware;