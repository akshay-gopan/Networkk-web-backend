const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config'); // Assuming your configured Sequelize instance

module.exports = (sequelize) => {
const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fname: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lname: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  locality: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  aadhaar: {
    type: DataTypes.STRING(12),
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
}, {
  timestamps: true,  // Enable createdAt and updatedAt
  tableName: 'users',
  hooks: {
    // Before creating a new user, hash the password
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Before updating the user, hash the new password if changed
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method to verify the password during login
User.prototype.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};


  return User;

}
