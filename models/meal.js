const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // DB 연결 인스턴스

const Meal = sequelize.define('Meal', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  meal_date: {
    type: DataTypes.DATE,  // DATE 타입 사용
    allowNull: false
  },
  meal_time: {
    type: DataTypes.STRING,  // 아침, 점심, 저녁 등 식사 시간
    allowNull: true
  },
  success_rate: {
    type: DataTypes.FLOAT,  // 성공률
    defaultValue: 0
  }
}, {
  timestamps: true,  // createdAt, updatedAt 자동 생성
  tableName: 'meals'  // 실제 DB 테이블 이름
});

module.exports = Meal;