const { addFridgeItem, getFridgeItemsByUser, updateFridgeItem, deleteFridgeItem } = require('../models/fridgeModel');

// 냉장고 재료 추가 핸들러
const createFridgeItem = async (req, res) => {
  const { userId, item } = req.body;
  try {
    const result = await addFridgeItem(userId, item);
    res.status(201).json({ message: '재료 추가 성공', itemId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: '재료 추가 실패', error });
  }
};

// 사용자 냉장고 재료 조회 핸들러
const getFridgeItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const items = await getFridgeItemsByUser(userId);
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: '냉장고 재료 조회 실패', error });
  }
};

// 냉장고 재료 수정 핸들러
const editFridgeItem = async (req, res) => {
  const { itemId } = req.params;
  const { item } = req.body;
  try {
    await updateFridgeItem(itemId, item);
    res.status(200).json({ message: '재료 수정 성공' });
  } catch (error) {
    res.status(500).json({ message: '재료 수정 실패', error });
  }
};

// 냉장고 재료 삭제 핸들러
const removeFridgeItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    await deleteFridgeItem(itemId);
    res.status(200).json({ message: '재료 삭제 성공' });
  } catch (error) {
    res.status(500).json({ message: '재료 삭제 실패', error });
  }
};

module.exports = { createFridgeItem, getFridgeItems, editFridgeItem, removeFridgeItem };