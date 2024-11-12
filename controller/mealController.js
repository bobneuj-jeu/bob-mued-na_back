const pool = require('../config/db');

// 식단 작성
exports.createMeal = async (req, res) => {
  try {
    const { username, meal_date, meal_time, food_item_ids, success_rate } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO Meals (username, meal_date, meal_time, food_item_ids, success_rate) VALUES (?, ?, ?, ?, ?)',
      [username, meal_date, meal_time, food_item_ids, success_rate]
    );
    conn.release();
    
    res.status(201).json({ message: '식단이 성공적으로 작성되었습니다.' });
  } catch (error) {
    console.error('식단 작성 에러:', error.message);
    res.status(500).json({ message: '식단 작성 중 오류가 발생했습니다.', error: error.message });
  }
};

// 이번 달 평균 식사률 조회
exports.getMonthlySuccessRate = async (req, res) => {
  try {
    const { username } = req.params;

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      `SELECT AVG(success_rate) AS average_success_rate FROM Meals WHERE username = ? AND MONTH(meal_date) = MONTH(CURRENT_DATE)`,
      [username]
    );
    conn.release();
    
    res.json({ average_success_rate: result.average_success_rate });
  } catch (error) {
    console.error('월간 식사율 조회 에러:', error.message);
    res.status(500).json({ message: '식사율 조회 중 오류가 발생했습니다.', error: error.message });
  }
};

// 이번 주 식단 조회
exports.getWeeklyMeals = async (req, res) => {
    try {
      const { username } = req.params;
      const conn = await pool.getConnection();
      
      const meals = await conn.query(
        `SELECT * FROM Meals WHERE username = ? AND YEARWEEK(meal_date, 1) = YEARWEEK(CURDATE(), 1)`,
        [username]
      );
      
      conn.release();
      
      res.json(meals);
    } catch (error) {
      console.error('이번주 식단 조회 에러:', error.message);
      res.status(500).json({ message: '식단 조회 중 오류가 발생했습니다.', error: error.message });
    }
  };
  
  // 식단 수정
  exports.updateMeal = async (req, res) => {
    try {
      const { id, meal_date, meal_time, food_item_ids, success_rate } = req.body;
      const conn = await pool.getConnection();
      
      await conn.query(
        `UPDATE Meals SET meal_date = ?, meal_time = ?, food_item_ids = ?, success_rate = ? WHERE id = ?`,
        [meal_date, meal_time, food_item_ids, success_rate, id]
      );
      
      conn.release();
      
      res.status(200).json({ message: '식단이 수정되었습니다.' });
    } catch (error) {
      console.error('식단 수정 에러:', error.message);
      res.status(500).json({ message: '식단 수정 중 오류가 발생했습니다.', error: error.message });
    }
  };

// 이번 달 식단 성공률 조회
exports.getMonthlySuccessRate = async (req, res) => {
    try {
      const { username } = req.params;
  
      const conn = await pool.getConnection();
      const [result] = await conn.query(
        `SELECT AVG(success_rate) AS average_success_rate FROM Meals WHERE username = ? AND MONTH(meal_date) = MONTH(CURRENT_DATE)`,
        [username]
      );
      conn.release();
      
      res.json({ average_success_rate: result.average_success_rate });
    } catch (error) {
      console.error('이번 달 식단 성공률 조회 에러:', error.message);
      res.status(500).json({ message: '식단 성공률 조회 중 오류가 발생했습니다.', error: error.message });
    }
  };

// 달력에 성공률 표시 (이번 달)
exports.getCalendarSuccessRate = async (req, res) => {
    try {
      const { username } = req.params;
  
      const conn = await pool.getConnection();
      const meals = await conn.query(
        `SELECT meal_date, success_rate FROM Meals WHERE username = ? AND MONTH(meal_date) = MONTH(CURRENT_DATE)`,
        [username]
      );
      conn.release();
  
      const calendarData = meals.map(meal => {
        const date = meal.meal_date.getDate();
        let status = 'no-meal'; // 기본값은 식단 없음
  
        if (meal.success_rate === 100) status = 'success';
        else if (meal.success_rate > 0) status = 'partial-success';
        else if (meal.success_rate === 0) status = 'failure';
  
        return { date, status };
      });
  
      res.json(calendarData);
    } catch (error) {
      console.error('달력 성공률 표시 에러:', error.message);
      res.status(500).json({ message: '달력 성공률 표시 중 오류가 발생했습니다.', error: error.message });
    }
  };  