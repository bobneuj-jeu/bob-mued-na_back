const User = require('../models/user');

// 회원가입
exports.signup = async (req, res) => {
  try {
    const { username, password, allergies, diabetes, anything } = req.body;

    // 유효성 검사
    if (!username || username.length > 20) {
      return res.status(400).json({ message: '아이디는 20자 이내여야 합니다.' });
    }

    if (!password || password.length < 8 || password.length > 12) {
      return res.status(400).json({ message: '비밀번호는 8~12자여야 합니다.' });
    }

    // 알러지와 기타질환 값이 없으면 '없음'으로 설정
    const allergiesValue = allergies || '없음';
    const anythingValue = anything || '없음';

    // 사용자 생성 (비밀번호 해싱 없이 평문 그대로 저장)
    await User.create({
      username,
      password,
      allergies: allergiesValue,
      diabetes,
      anything: anythingValue
    });

    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('회원가입 에러:', error.message);
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.', error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 사용자 조회
    const user = await User.findOne({ where: { username } });

    // 아이디가 존재하지 않으면
    if (!user) {
      return res.status(401).json({ message: '아이디가 존재하지 않습니다.' });
    }

    // 비밀번호 비교
    if (password !== user.password) { 
      return res.status(401).json({ message: '비밀번호가 잘못되었습니다.' });
    }

    // 로그인 성공 시 사용자 정보 반환
    res.status(200).json({
      message: '로그인 성공',
      username: user.username
    });
  } catch (error) {
    console.error('로그인 에러:', error.message);
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.', error: error.message });
  }
};

// 사용자 정보 조회 
exports.getUserInfo = async (req, res) => {
  try {
    const { username } = req.params;

    // 사용자 정보 조회
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      username: user.username,
      allergies: user.allergies,
      diabetes: user.diabetes,
      anything: user.anything
    });
  } catch (error) {
    console.error('사용자 정보 조회 에러:', error.message);
    res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.', error: error.message });
  }
};

// 비밀번호 변경
exports.changePassword = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    // 사용자 조회
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 확인
    if (currentPassword !== user.password) { 
      return res.status(401).json({ message: '현재 비밀번호가 잘못되었습니다.' });
    }

    // 새 비밀번호를 그대로 저장
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('비밀번호 변경 에러:', error.message);
    res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.', error: error.message });
  }
};

// 질환 수정
exports.updateUserDiseases = async (req, res) => {
  try {
    const { username } = req.params;
    const { allergies, diabetes, anything } = req.body;

    // 사용자 조회
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 질환 정보 수정
    user.allergies = allergies || '없음';
    user.diabetes = diabetes || '당뇨없음';
    user.anything = anything || '없음';

    await user.save();

    res.status(200).json({ message: '사용자 질환 정보가 수정되었습니다.' });
  } catch (error) {
    console.error('질환 수정 에러:', error.message);
    res.status(500).json({ message: '질환 수정 중 오류가 발생했습니다.', error: error.message });
  }
};
