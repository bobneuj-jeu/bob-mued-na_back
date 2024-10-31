const bcrypt = require('bcryptjs');
const db = require('../database/db'); // DB 연결

// 사용자 등록 함수
const registerUser = async (req, res) => {
  const { username, password, allergies, diabetes, other_conditions } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const userAllergies = allergies || 'none';
  const userDiabetes = diabetes || 'none';
  const userOtherConditions = other_conditions || 'none';

  const query = `
    INSERT INTO users (username, password, allergies, diabetes, other_conditions)
    VALUES (?, ?, ?, ?, ?)`;

  try {
    await db.query(query, [username, hashedPassword, userAllergies, userDiabetes, userOtherConditions]);
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '회원가입 중 오류 발생', error });
  }
};

// 로그인 함수
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT password FROM users WHERE username = ?`;

  try {
    const [user] = await db.query(query, [username]);

    if (user.length === 0) {
      return res.status(401).json({ message: '사용자 이름 또는 비밀번호가 잘못되었습니다.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: '사용자 이름 또는 비밀번호가 잘못되었습니다.' });
    }

    res.status(200).json({ message: '로그인 성공!' });
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류 발생', error });
  }
};

// 로그아웃 처리
const logout = ('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logout successful');
});

// 성공률 계산 함수
const calculateSuccessRate = (req, res) => {
  const { allergies, diabetes, other_conditions } = req.body;

  let score = 100;

  if (allergies && allergies !== 'none') {
    score -= 20;
  }

  if (diabetes && diabetes !== 'none') {
    score -= 30;
  }

  if (other_conditions && other_conditions !== 'none') {
    score -= 10;
  }

  const successRate = Math.max(score, 0); // 0점 이하로는 떨어지지 않도록
  res.status(200).json({ successRate });
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  calculateSuccessRate // 성공률 계산 함수 내보내기
};