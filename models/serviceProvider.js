const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config'); // Import your Sequelize instance

module.exports = (sequelize) => {
  const ServiceProvider = sequelize.define('ServiceProvider', {
    serviceProviderId: {
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
    timestamps: true, // Enable createdAt and updatedAt fields
    tableName: 'serviceProviders',
    hooks: {
      // Hash password before creating a new service provider
      beforeCreate: async (serviceProvider) => {
        if (serviceProvider.password) {
          const salt = await bcrypt.genSalt(10);
          serviceProvider.password = await bcrypt.hash(serviceProvider.password, salt);
        }
      },
      // Hash password before updating the service provider's password
      beforeUpdate: async (serviceProvider) => {
        if (serviceProvider.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          serviceProvider.password = await bcrypt.hash(serviceProvider.password, salt);
        }
      }
    }
  });

  // Method to verify password during login
  ServiceProvider.prototype.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return ServiceProvider;
}
