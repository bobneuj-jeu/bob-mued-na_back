const db = require('../models/meal');
const { Configuration, OpenAIApi } = require('openai');

// 식사 날짜 및 시간 선택
exports.selectMealTime = (req, res) => {
    const { username, meal_date, meal_time } = req.body;
    let mealStatus = '없음';

    if (meal_date && meal_time) {
        mealStatus = `${meal_time}`; // '아침', '점심', '저녁' 등의 값으로 설정
    }

    // 이미 선택된 식사 날짜 및 시간이 있는지 확인
    db.query('SELECT * FROM Meals WHERE username = ? AND meal_date = ?', [username, meal_date], (err, results) => {
        if (err) {
            console.error('식사 날짜 선택 오류: ', err);
            return res.status(500).send('서버 오류');
        }

        if (results.length > 0) {
            // 이미 해당 날짜와 시간에 대한 선택이 존재한다면, /createMealPlan로 넘어가도록 처리
            return res.redirect('/meals/createMealPlan'); // 리디렉션 (혹은 API 호출)
        }

        // 식사 날짜 및 시간 선택
        db.query('INSERT INTO Meals (username, meal_date, meal_time, meal_status) VALUES (?, ?, ?, ?)', 
            [username, meal_date, meal_time, mealStatus], (err, results) => {
                if (err) {
                    console.error('식사 날짜 선택 오류: ', err);
                    return res.status(500).send('서버 오류');
                }
                res.send('식사 날짜 및 시간 선택 완료');
            });
    });
};

// 식단 수정
exports.updateMealPlan = (req, res) => {
    const { meal_date, username, mealIndex, updatedMealArray } = req.body;

    // 기존 식단을 가져오기 위해 SELECT 쿼리 실행
    db.query('SELECT meal_plan FROM MealPlan WHERE meal_date = ? AND username = ?', [meal_date, username], (err, results) => {
        if (err) {
            console.error('식단 조회 오류: ', err);
            return res.status(500).send('서버 오류');
        }

        if (results.length === 0) {
            return res.status(404).send('식단을 찾을 수 없습니다');
        }

        // 기존 meal_plan 데이터를 JSON으로 파싱
        let mealPlans = JSON.parse(results[0].meal_plan);

        // 인덱스를 사용하여 수정할 배열을 찾고 수정
        if (mealIndex >= 0 && mealIndex < mealPlans.length) {
            mealPlans[mealIndex] = updatedMealArray;  // 해당 배열을 수정
        } else {
            return res.status(400).send('유효하지 않은 인덱스입니다');
        }

        // 수정된 mealPlans 배열을 다시 DB에 저장
        db.query('UPDATE MealPlan SET meal_plan = ? WHERE meal_date = ? AND username = ?',
            [JSON.stringify(mealPlans), meal_date, username], (err, updateResults) => {
                if (err) {
                    console.error('식단 수정 오류: ', err);
                    return res.status(500).send('서버 오류');
                }
                res.send('식단 수정 완료');
            });
    });
};

// 식단 조회
exports.viewMealPlan = (req, res) => {
  const { username, meal_date } = req.query;

  db.query('SELECT * FROM MealPlan WHERE username = ? AND meal_date = ?', [username, meal_date], (err, results) => {
      if (err) {
          console.error('식단 조회 오류: ', err);
          return res.status(500).send('서버 오류');
      }

      // 식단 데이터가 없으면 404 에러 반환
      if (results.length === 0) {
          return res.status(404).send('식단을 찾을 수 없습니다');
      }

      // 전체 식단 데이터 반환
      res.json({
          meal_date: meal_date,
          meal_plan: JSON.parse(results[0].meal_plan)
      });
  });
};

// 식단 인증
exports.authenticateMeal = (req, res) => {
    const { username, meal_date } = req.body;

    // 당일 및 이전일만 인증 가능
    const today = new Date();
    const previousDay = new Date(today);
    previousDay.setDate(today.getDate() - 1);
    
    const mealDate = new Date(meal_date);
    
    if (mealDate > today || mealDate < previousDay) {
        return res.status(400).send('인증은 당일 및 이전일만 가능합니다.');
    }

    // 인증된 이미지 저장 처리 (파일 경로 등)
    console.log('식사 인증 이미지:', req.file.path);

    // 인증 성공 처리 (식사 인증 성공 업데이트 등)
    res.send('식사 인증 완료');
};

// 식사 성공률 계산 및 조회 
exports.calculateAndViewSuccessRate = (req, res) => {
  const { username } = req.query;

  // 먼저 meal_date가 '없음'이 아닌 날짜를 제외하고 계산
  db.query('SELECT meal_date, meal_time, success_rate FROM Meals WHERE username = ? AND meal_date != "없음" AND meal_time != "없음"', 
      [username], (err, results) => {
          if (err) {
              console.error('식사 성공률 계산 오류: ', err);
              return res.status(500).send('서버 오류');
          }

          // 성공적인 식사와 전체 식사 수 초기화
          let total = 0;
          let success = 0;

          // '없음'이 아닌 meal_date와 meal_time만 필터링
          results.forEach(meal => {
              if (meal.meal_time !== '없음' && meal.meal_date !== '없음') {
                  total++;  // 유효한 식사 수 증가
                  if (meal.success_rate === 1) {  // 성공한 식사는 success_rate가 1로 표시된다고 가정
                      success++;  // 성공한 식사 수 증가
                  }
              }
          });

          // 성공률 계산
          const successRate = total > 0 ? (success / total) * 100 : 0; // 성공률 계산 (전체 식사 수가 0인 경우 0%)

          // 결과 반환
          res.json({
              username: username,
              success_rate: successRate
          });
      });
};