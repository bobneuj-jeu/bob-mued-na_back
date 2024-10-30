const db = require('../database/db'); // DB 연결

const alterTable = async () => {
  const query = `
    ALTER TABLE users 
    ADD COLUMN allergies VARCHAR(255) DEFAULT 'none', 
    MODIFY COLUMN diabetes ENUM('none', 'type1', 'type2', 'gestational') DEFAULT 'none', 
    ADD COLUMN other_conditions VARCHAR(255) DEFAULT 'none';`;

  try {
    await db.query(query);
    console.log("테이블 수정 완료!");
  } catch (error) {
    console.error("테이블 수정 중 오류 발생:", error);
  }
};

// 실행
alterTable();