const FoodItem = require('../models/foodItem');

let fridgeItems = [];

// 냉장고 재료 추가
exports.addFridgeItem = (req, res) => { 
  try {
    const { username } = req.params;
    const { itemname } = req.body;

    // 유효성 검사: itemname이 null이거나 공백이면 오류 메시지 반환
    if (!itemname || itemname.trim() === '') {
      return res.status(400).json({ message: '식자재 이름은 빈 값일 수 없습니다.' });
    }

    // 유저의 냉장고에 해당하는 식자재 목록이 없으면 초기화
    if (!fridgeItems[username]) {
      fridgeItems[username] = [];
    }

    // 새로운 재료 추가 (배열에 푸시)
    fridgeItems[username].push(itemname);

    res.status(201).json({ message: '재료가 추가되었습니다.' });
  } catch (error) {
    console.error('냉장고 재료 추가 에러:', error.message);
    res.status(500).json({ message: '냉장고 재료 추가 중 오류가 발생했습니다.', error: error.message });
  }
};


// 유저 식자재 보여줌
exports.getFridgeItems = (req, res) => {
  try {
    const { username } = req.params;

    // 해당 유저의 모든 식자재 가져오기 (배열 형식)
    const userItems = fridgeItems[username];

    // 유저의 식자재가 없으면
    if (!userItems || userItems.length === 0) {
      return res.status(404).json({ message: '해당 유저의 냉장고에 식자재가 없습니다.' });
    }

    // 유저의 모든 식자재 목록 반환
    res.status(200).json({ items: userItems });
  } catch (error) {
    console.error('식자재 목록 조회 중 오류 발생:', error.message);
    res.status(500).json({ message: '식자재 목록 조회 중 오류가 발생했습니다.', error: error.message });
  }
};

// 식자재 삭제
exports.deleteFridgeItem = (req, res) => {
  try {
    const { username } = req.params;
    const { itemname } = req.body;

    // 유효성 검사: username 또는 itemname이 없으면 에러 메시지 반환
    if (!username) {
      return res.status(400).json({ message: 'username이 누락되었습니다.' });
    }

    if (!itemname || itemname.trim() === '') {
      return res.status(400).json({ message: 'itemname이 누락되었거나 빈 값입니다.' });
    }

    // 해당 유저의 냉장고에 해당하는 식자재 목록이 없다면
    if (!fridgeItems[username]) {
      return res.status(404).json({ message: '해당 유저의 냉장고에 식자재가 없습니다.' });
    }

    // 유저의 냉장고에서 itemname에 해당하는 식자재 찾기
    const index = fridgeItems[username].indexOf(itemname);

    // 해당 식자재가 없으면 에러 메시지 반환
    if (index === -1) {
      return res.status(404).json({ message: '해당 유저의 냉장고에 해당 식자재가 없습니다.' });
    }

    // 식자재 삭제
    fridgeItems[username].splice(index, 1);

    // 삭제 성공 메시지 반환
    res.status(200).json({ message: '식자재가 삭제되었습니다.' });
  } catch (error) {
    console.error('식자재 삭제 중 오류 발생:', error.message);
    res.status(500).json({ message: '식자재 삭제 중 오류가 발생했습니다.', error: error.message });
  }
};
