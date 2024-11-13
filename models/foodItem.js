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
  timestamps: false 
});

module.exports = FoodItem;