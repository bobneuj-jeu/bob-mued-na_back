const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  allergies: {
    type: DataTypes.STRING,
    defaultValue: '없음'
  },
  diabetes: {
    type: DataTypes.STRING,
    defaultValue: '당뇨없음'
  },
  anything: {
    type: DataTypes.STRING,
    defaultValue: '없음'
  }
}, {
  tableName: 'Users',
  timestamps: false
});

module.exports = User;