// 오류 처리 미들웨어
const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // 콘솔에 오류 스택 출력
    res.status(500).json({ message: '서버 내부 오류입니다.' }); // 사용자에게 오류 메시지 반환
};

module.exports = errorMiddleware;