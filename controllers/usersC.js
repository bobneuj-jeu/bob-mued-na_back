const pool = require('../config/db'); // DB 연결 설정 가져오기
const bcrypt = require('bcryptjs'); // 비밀번호 해시화를 위한 bcrypt 모듈

// 회원가입 처리
exports.signup = async (req, res) => {
    const { userId, password } = req.body; // 요청에서 사용자명과 비밀번호 가져오기
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해시화

    const query = 'INSERT INTO users (userId, password) VALUES (?, ?)';
    try {
        await pool.query(query, [userId, hashedPassword]); // DB에 사용자 정보 삽입
        res.status(201).json({ message: '회원가입 성공' }); // 성공 메시지 전송
    } catch (err) {
        console.error(err); // 오류 로그 출력
        res.status(500).json({ error: '회원가입 중 오류 발생' }); // 오류 메시지 전송
    }
};

// 로그인 처리
exports.login = async (req, res) => {
    const { userId, password } = req.body; // 요청에서 사용자명과 비밀번호 가져오기
    const query = 'SELECT * FROM users WHERE userId = ?'; // 사용자 조회 쿼리

    try {
        const [user] = await pool.query(query, [userId]); // 사용자 정보 조회
        if (user && await bcrypt.compare(password, user.password)) { // 비밀번호 확인
            req.session.userId = user.id; // 세션에 사용자 ID 저장
            res.json({ message: '로그인 성공' }); // 성공 메시지 전송
        } else {
            res.status(401).json({ error: '잘못된 사용자명 또는 비밀번호' }); // 오류 메시지 전송
        }
    } catch (err) {
        console.error(err); // 오류 로그 출력
        res.status(500).json({ error: '로그인 중 오류 발생' }); // 오류 메시지 전송
    }
};