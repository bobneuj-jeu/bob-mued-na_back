// src/scripts/createTestUsers.js
const bcrypt = require('bcryptjs');
const db = require('../database/db'); // DB 연결

const createTestUsers = async () => {
  const users = [
    { username: 'testuser1', password: 'password123' },
    { username: 'testuser2', password: 'password456' },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10); // 비밀번호 해싱
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    await db.query(query, [user.username, hashedPassword]); // DB에 사용자 추가
    console.log(`Created user: ${user.username}`);
  }

  console.log('모든 테스트 계정이 생성되었습니다.');
  process.exit();
};

createTestUsers().catch((error) => {
  console.error('테스트 계정 생성 중 오류 발생:', error);
  process.exit(1);
});