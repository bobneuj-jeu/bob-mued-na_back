const mysql = require('mysql2');
const { Configuration, OpenAIApi } = require('openai');

// OpenAI API 설정
const configuration = new Configuration({
    apiKey: 'your-api-key', // OpenAI API 키 입력
});
const openai = new OpenAIApi(configuration);

// MySQL 데이터베이스 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your-password',  // MySQL 비밀번호
    database: 'meal_planner',
});

// 사용자의 건강 상태 및 알러지 정보 확인
function getUserInfo(username, callback) {
    db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('사용자 조회 오류: ', err);
            callback(null);
            return;
        }
        if (!results.length) {
            console.error('사용자를 찾을 수 없습니다.');
            callback(null);
            return;
        }
        callback(results[0]); // 사용자 정보 반환
    });
}

// AI 모델을 사용하여 식단 추천
function getMealPlanFromAI(userInfo, callback) {
    const prompt = `
        사용자 정보:
        건강 상태: ${userInfo.health_conditions}
        알러지: ${userInfo.allergies}
        
        이 정보를 바탕으로 사용자의 요구에 맞는 저당, 알러지 유발 음식 제외한 식단을 추천해 주세요.
    `;

    // OpenAI API 호출
    openai.createCompletion({
        model: 'gpt-4',
        prompt: prompt,
        max_tokens: 300,
    }).then(response => {
        const mealPlan = response.data.choices[0].text.trim();
        callback(mealPlan);
    }).catch(err => {
        console.error('AI 모델 호출 실패: ', err);
        callback(null);
    });
}

// 추천된 식단을 데이터베이스에 저장
function saveMealPlanToDB(username, mealDate, mealPlan) {
    // mealPlan은 AI에서 추천한 식단 정보
    const [main1, main2, side1, side2, side3, dessert] = mealPlan.split(','); // 식단을 컴마로 구분했다고 가정

    db.query(
        'INSERT INTO MealPlan (meal_date, main1, main2, side1, side2, side3, dessert, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [mealDate, main1, main2, side1, side2, side3, dessert, username],
        (err, results) => {
            if (err) {
                console.error('식단 저장 오류: ', err);
                return;
            }
            console.log('식단 저장 완료');
        }
    );
}

// 식단 작성 API
exports.createMealPlan = (req, res) => {
    const { username, meal_date } = req.body;

    // 사용자의 정보 조회
    getUserInfo(username, (userInfo) => {
        if (!userInfo) {
            return res.status(404).send('사용자를 찾을 수 없습니다.');
        }

        // AI 모델을 통해 식단 추천
        getMealPlanFromAI(userInfo, (recommendedMeal) => {
            if (!recommendedMeal) {
                return res.status(500).send('AI 식단 추천 오류');
            }

            // 추천된 식단을 데이터베이스에 저장
            saveMealPlanToDB(username, meal_date, recommendedMeal);

            // 성공 응답
            res.send('식단 작성 완료');
        });
    });
};


