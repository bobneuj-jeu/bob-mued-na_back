// src/controllers/usersController.js

const bcrypt = require('bcrypt');
const db = require('../database/db'); // DB 연결

// 사용자 등록 함수
const registerUser = async (req, res) => {
  const { username, password, allergies, diabetes, other_conditions } = req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 입력 데이터 기본값 처리
  const userAllergies = allergies || 'none';
  const userDiabetes = diabetes || 'none'; // 종류로 변경
  const userOtherConditions = other_conditions || 'none';

  // DB에 사용자 추가
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

const calculateSuccessRate = (allergies, diabetes, other_conditions) => {
  let score = 100; // 기본 점수 100
  
  // 알러지에 대한 조건
  if (allergies && allergies !== 'none') {
    score -= 20; // 알러지가 있을 경우 20점 차감
  }

  // 당뇨에 대한 조건
  if (diabetes && diabetes !== 'none') {
    score -= 30; // 당뇨가 있을 경우 30점 차감
  }

  // 기타 질환에 대한 조건
  if (other_conditions && other_conditions !== 'none') {
    score -= 10; // 기타 질환이 있을 경우 10점 차감
  }

  return Math.max(score, 0); // 0점 이하로는 떨어지지 않도록
};

module.exports = { registerUser };