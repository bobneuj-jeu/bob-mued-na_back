const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FoodItem = sequelize.define('FoodItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  itemname: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'FoodItems',
  timestamps: false // 이 모델에서 createdAt, updatedAt 필드를 사용하지 않음
});

module.exports = FoodItem;