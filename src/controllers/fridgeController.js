const { addFridgeItem, getFridgeItemsByUser, deleteFridgeItem } = require('../models/fridgeModel');
const db = require('../database/db');

// 재료 추가
const createFridgeItem = async (req, res) => {
  const { username, itemName } = req.body;

  if (!username || !itemName) {
    return res.status(400).json({ message: 'username과 itemName 값이 필요합니다.' });
  }

  try {
    const result = await addFridgeItem(username, itemName);
    res.status(201).json({ message: '재료 추가 성공', data: { id: result.insertId } });
  } catch (error) {
    console.error(`Error adding item for user ${username}:`, error);
    res.status(500).json({ message: '재료 추가 실패', error: error.message });
  }
};

// 재료 조회
const getFridgeItems = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'username이 필요합니다.' });
  }

  try {
    const items = await getFridgeItemsByUser(username);
    res.status(200).json({ message: '조회 성공', data: { items } });
  } catch (error) {
    console.error(`Error retrieving items for user ${username}:`, error);
    res.status(500).json({ message: '냉장고 재료 조회 실패', error: error.message });
  }
};

// 재료 삭제
const removeFridgeItem = async (req, res) => {
  const { username, itemName } = req.body;
  
  if (!username || !itemName) {
    return res.status(400).json({ message: 'username과 itemName이 필요합니다.' });
  }

  try {
    await deleteFridgeItem(username, itemName);
    res.status(200).json({ message: '재료 삭제 성공' });
  } catch (error) {
    console.error(`Error deleting item ${itemName} for user ${username}:`, error);
    res.status(500).json({ message: '재료 삭제 실패', error: error.message });
  }
};

module.exports = { createFridgeItem, getFridgeItems, removeFridgeItem };