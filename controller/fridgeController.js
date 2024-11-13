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

// 유저의 식자재 목록을 보여주는 API
exports.getFridgeItems = async (req, res) => {
  try {
    const { username } = req.params;  // URL에서 유저 이름 받기

    // 해당 유저의 모든 식자재 가져오기
    const fridgeItems = await FoodItem.findAll({
      where: {
        username: username  // 유저명으로 필터링
      }
    });

    // 유저의 식자재가 없으면
    if (fridgeItems.length === 0) {
      return res.status(404).json({ message: '해당 유저의 냉장고에 식자재가 없습니다.' });
    }

    // 유저의 모든 식자재 목록 반환
    res.status(200).json({ items: fridgeItems });
  } catch (error) {
    console.error('식자재 목록 조회 중 오류 발생:', error.message);
    res.status(500).json({ message: '식자재 목록 조회 중 오류가 발생했습니다.', error: error.message });
  }
};

// 식자재 삭제 API
exports.deleteFridgeItem = async (req, res) => {
  try {
    const { username } = req.params;  // URL에서 유저 이름 받기
    const { itemname } = req.body;    // 요청 본문에서 삭제할 식자재 이름 받기

    // 해당 유저의 냉장고에서 itemname에 해당하는 식자재 찾기
    const fridgeItem = await FoodItem.findOne({
      where: {
        username: username,  // 유저명
        itemname: itemname   // 식자재명
      }
    });

    // 유저의 냉장고에 해당 식자재가 없으면 에러 메시지 반환
    if (!fridgeItem) {
      return res.status(404).json({ message: '해당 유저의 냉장고에 해당 식자재가 없습니다.' });
    }

    // 식자재 삭제
    await fridgeItem.destroy();

    // 삭제 성공 메시지 반환
    res.status(200).json({ message: '식자재가 삭제되었습니다.' });
  } catch (error) {
    console.error('식자재 삭제 중 오류 발생:', error.message);
    res.status(500).json({ message: '식자재 삭제 중 오류가 발생했습니다.', error: error.message });
  }
};