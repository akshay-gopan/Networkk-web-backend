const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config'); // Assuming your configured Sequelize instance

module.exports = (sequelize) => {
  const ServiceProvider = sequelize.define('ServiceProvider', {
    serviceProviderId: {
      type: DataTypes.STRING, // Changed to STRING to allow the "SP0" prefix
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
      type: DataTypes.STRING(255),
      allowNull: false,
    }
  }, {
    timestamps: true, // Enable createdAt and updatedAt fields
    tableName: 'serviceProviders',
    hooks: {
      // Generate "SP0XX" serviceProviderId before creating a new service provider
      beforeCreate: async (serviceProvider, options) => {
        // Get the highest serviceProviderId in the format "SP0XX"
        const lastProvider = await ServiceProvider.findOne({
          order: [['createdAt', 'DESC']], // Get the last created service provider
        });

        let newProviderId = "SP01"; // Default first provider ID if no providers exist

        if (lastProvider) {
          const lastProviderId = lastProvider.serviceProviderId;
          const numericPart = parseInt(lastProviderId.replace("SP", ""), 10); // Extract the numeric part of the last ID
          const newNumericPart = numericPart + 1; // Increment the numeric part
          newProviderId = `SP${newNumericPart.toString().padStart(2, '0')}`; // Generate new ID with "SP0" prefix and padding
        }

        serviceProvider.serviceProviderId = newProviderId; // Set the new service provider ID

        // Hash password before saving
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

  ServiceProvider.associate = (models) => {
    ServiceProvider.hasMany(models.Service, {
      foreignKey: 'serviceProviderId',
      as: 'services',
    });
  };
  

  return ServiceProvider;
};

