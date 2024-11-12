const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// 회원가입
exports.signup = async (req, res) => {
    try {
      const { username, password, allergies, diabetes, anything } = req.body;
  
      // 유효성 검사
      if (!username || username.length > 20) {
        return res.status(400).json({ message: '아이디는 20자 이내여야 합니다.' });
      }
  
      if (!password || !/(?=.*\W)(?=.*[a-z]).{8,12}/.test(password)) {
        return res.status(400).json({ message: '비밀번호는 8~12자, 소문자와 특수문자를 포함해야 합니다.' });
      }
  
      // 알러지와 기타질환 값이 없으면 '없음'으로 설정
      const allergiesValue = allergies || '없음';
      const anythingValue = anything || '없음';
  
      // 비밀번호 암호화
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const conn = await pool.getConnection();
      await conn.query(
        'INSERT INTO Users (username, password, allergies, diabetes, anything, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [username, hashedPassword, allergiesValue, diabetes, anythingValue]
      );      
      conn.release();
      
      res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } catch (error) {
      console.error('회원가입 에러:', error.message);
      res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.', error: error.message });
    }
  };  

// 로그인
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const conn = await pool.getConnection();

    const user = await conn.query('SELECT * FROM Users WHERE username = ?', [username]);
    conn.release();

    if (user.length === 0 || !(await bcrypt.compare(password, user[0].password))) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign({ id: user[0].id, username: user[0].username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({username});
  } catch (error) {
    console.error('로그인 에러:', error.message);
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.', error: error.message });
  }
};

// 사용자 정보 조회
exports.getUserInfo = async (req, res) => {
    try {
      const { username } = req.params;
  
      const conn = await pool.getConnection();
      const user = await conn.query('SELECT * FROM Users WHERE username = ?', [username]);
      conn.release();
  
      if (user.length === 0) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
  
      res.json(user[0]);
    } catch (error) {
      console.error('사용자 정보 조회 에러:', error.message);
      res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.', error: error.message });
    }
  };
  
  // 비밀번호 변경
  exports.changePassword = async (req, res) => {
    try {
      const { username, newPassword } = req.body;
  
      const conn = await pool.getConnection();
      const hashedPassword = await bcrypt.hash(newPassword, 15);
  
      await conn.query(
        'UPDATE Users SET password = ? WHERE username = ?',
        [hashedPassword, username]
      );
      conn.release();
  
      res.status(200).json({ message: '비밀번호가 변경되었습니다.' });
    } catch (error) {
      console.error('비밀번호 변경 에러:', error.message);
      res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.', error: error.message });
    }
  };
  
  // 질환 수정
  exports.updateUserDiseases = async (req, res) => {
    try {
      const { username, allergies, diabetes, anything } = req.body;
  
      const conn = await pool.getConnection();
      await conn.query(
        'UPDATE Users SET allergies = ?, diabetes = ?, anything = ? WHERE username = ?',
        [allergies, diabetes, anything, username]
      );
      conn.release();
  
      res.status(200).json({ message: '사용자 질환 정보가 수정되었습니다.' });
    } catch (error) {
      console.error('질환 수정 에러:', error.message);
      res.status(500).json({ message: '질환 수정 중 오류가 발생했습니다.', error: error.message });
    }
  };  