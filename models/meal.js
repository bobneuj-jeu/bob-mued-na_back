const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Meal = sequelize.define('Meal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  meal_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  meal_time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  food_item_ids: {
    type: DataTypes.JSONB,  // 배열이나 JSON 형태로 저장
    allowNull: false
  },
  success_rate: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Meals',
  timestamps: false // timestamps를 사용하지 않음
});

module.exports = Meal;