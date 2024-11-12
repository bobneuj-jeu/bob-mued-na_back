// 냉장고 재료 추가
exports.addFridgeItem = async (req, res) => {
  try {
    const { username, itemname } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO FoodItems (username, itemname) VALUES (?, ?)',
      [username, itemname]
    );
    conn.release();

    res.status(201).json({ message: '재료가 추가되었습니다.' });
  } catch (error) {
    console.error('냉장고 재료 추가 에러:', error.message);
    res.status(500).json({ message: '냉장고 재료 추가 중 오류가 발생했습니다.', error: error.message });
  }
};

// 냉장고 재료 수정
exports.updateFridgeItem = async (req, res) => {
  try {
    const { id, itemname } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE FoodItems SET itemname = ? WHERE id = ?',
      [itemname, id]
    );
    conn.release();

    res.status(200).json({ message: '재료가 수정되었습니다.' });
  } catch (error) {
    console.error('냉장고 재료 수정 에러:', error.message);
    res.status(500).json({ message: '냉장고 재료 수정 중 오류가 발생했습니다.', error: error.message });
  }
};

// 냉장고 재료 삭제
exports.deleteFridgeItem = async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await pool.getConnection();
    await conn.query(
      'DELETE FROM FoodItems WHERE id = ?',
      [id]
    );
    conn.release();

    res.status(200).json({ message: '재료가 삭제되었습니다.' });
  } catch (error) {
    console.error('냉장고 재료 삭제 에러:', error.message);
    res.status(500).json({ message: '냉장고 재료 삭제 중 오류가 발생했습니다.', error: error.message });
  }
};