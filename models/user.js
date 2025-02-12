const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config'); // Assuming your configured Sequelize instance

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.STRING, // Change to STRING to allow a prefix
      primaryKey: true,
    },
    fname: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lname: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
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
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    aadhaar: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(300),
      allowNull: false,
      validate: {
        len: [4, 100], // Password must be between 6 and 100 characters
      },
    },
    profile_picture: {
      type: DataTypes.STRING, // Store the image URL
      allowNull: true,
    },

    favorites: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  }, {
    timestamps: true,  // Enable createdAt and updatedAt
    tableName: 'users',
    hooks: {
      // Before creating a new user, generate a userId with "U0" prefix
      beforeCreate: async (user, options) => {
        // Get the highest userId in the format "U0XX"
        const lastUser = await sequelize.models.User.findOne({
          order: [['createdAt', 'DESC']]  // Get the last created user
        });

        let newUserId = "UR01"; // Default first user ID if no users exist

        if (lastUser) {
          const lastUserId = lastUser.userId;
          const numericPart = parseInt(lastUserId.replace("UR", ""), 10); // Extract the numeric part of the last ID
          const newNumericPart = numericPart + 1; // Increment the numeric part
          newUserId = `UR${newNumericPart.toString().padStart(2, '0')}`; // Generate new ID with "U0" prefix and padding
        }

        user.userId = newUserId; // Set the new user ID

        // Hash password before saving
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
};
