// 요청 로깅 미들웨어
const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`); // 요청 메서드와 URL 출력
    next(); // 다음 미들웨어로 진행
};

module.exports = requestLogger;