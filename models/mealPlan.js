const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MealPlan = sequelize.define('MealPlan', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mealPlan: {
      type: DataTypes.JSON, // JSON 형식으로 식단을 저장
      allowNull: false
    }
  }, {
    tableName: 'MealPlans',
    timestamps: true  // createdAt, updatedAt 자동 관리
  });

  exports.MealPlan;