const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Meal = sequelize.define('Meal', {
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
    allowNull: true
  },
  success_rate: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'meals'
});

module.exports = Meal;