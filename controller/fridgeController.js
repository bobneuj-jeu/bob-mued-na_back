const FoodItem = require('../models/foodItem');

// 냉장고 재료 추가
exports.addFridgeItem = async (req, res) => {
  try {
    const { username, itemname } = req.body;

    // 새로운 재료 추가
    await FoodItem.create({ username, itemname });

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

    // 해당 id의 재료를 찾아서 수정
    const fridgeItem = await FoodItem.findByPk(id);
    if (!fridgeItem) {
      return res.status(404).json({ message: '해당 재료를 찾을 수 없습니다.' });
    }

    fridgeItem.itemname = itemname;
    await fridgeItem.save();

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

    // 해당 id의 재료를 찾아서 삭제
    const fridgeItem = await FoodItem.findByPk(id);
    if (!fridgeItem) {
      return res.status(404).json({ message: '해당 재료를 찾을 수 없습니다.' });
    }

    await fridgeItem.destroy();

    res.status(200).json({ message: '재료가 삭제되었습니다.' });
  } catch (error) {
    console.error('냉장고 재료 삭제 에러:', error.message);
    res.status(500).json({ message: '냉장고 재료 삭제 중 오류가 발생했습니다.', error: error.message });
  }
};