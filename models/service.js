// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const Service = sequelize.define('Service', {
//     serviceId: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     title: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     category: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     basePrice: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     demoPics: {
//       type: DataTypes.JSON, // Storing an array of URLs as JSON
//       allowNull: true,
//     },
//     holidays: {
//       type: DataTypes.JSON, // Storing holidays as an array of dates
//       allowNull: true,
//     },
//     isOpen: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//       allowNull: false,
//     },
//     avgRating: {
//       type: DataTypes.FLOAT,
//       defaultValue: 0.0,
//     },
//     reviewCount: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//     },
//     serviceProviderId: {
//       type: DataTypes.STRING, // Matches the `serviceProviderId` format in the ServiceProvider model
//       allowNull: false,
//       references: {
//         model: 'serviceProviders', // Reference the serviceProviders table
//         key: 'serviceProviderId',
//       },
//       onDelete: 'CASCADE', // If a service provider is deleted, delete their services
//     },
//     address: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     locality: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     latitude: {
//       type: DataTypes.DECIMAL(10, 7),
//       allowNull: false,
//     },
//     longitude: {
//       type: DataTypes.DECIMAL(10, 7),
//       allowNull: false,
//     },
//   }, {
//     tableName: 'services',
//     timestamps: true, // Enable createdAt and updatedAt fields
//   });

//   // Define associations
//   Service.associate = (models) => {
//     // A service belongs to a single service provider
//     Service.belongsTo(models.ServiceProvider, {
//       foreignKey: 'serviceProviderId',
//       as: 'serviceProvider',
//     });
//   };

//   return Service;
// };


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Service = sequelize.define('Service', {
    serviceId: {
      type: DataTypes.STRING, // Changed to STRING to allow "SRXX" format
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    basePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    demoPics: {
      type: DataTypes.JSON, // Storing an array of URLs as JSON
      allowNull: true,
    },
    holidays: {
      type: DataTypes.JSON, // Storing holidays as an array of dates
      allowNull: true,
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    avgRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    serviceProviderId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'serviceProviders', // Reference the serviceProviders table
        key: 'serviceProviderId',
      },
      onDelete: 'CASCADE',
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true, // Automatically filled from ServiceProvider
    },
    locality: {
      type: DataTypes.STRING(100),
      allowNull: true, // Automatically filled from ServiceProvider
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true, // Automatically filled from ServiceProvider
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true, // Automatically filled from ServiceProvider
    },
  }, {
    tableName: 'services',
    timestamps: true,
    hooks: {
      beforeCreate: async (service, options) => {
        // Generate custom service ID in "SRXX" format
        const lastService = await Service.findOne({
          order: [['createdAt', 'DESC']],
        });
      
        let newServiceId = 'SR01'; // Default first ID if no services exist
        if (lastService && lastService.serviceId) {
          const lastServiceId = lastService.serviceId;
          const numericPart = parseInt(lastServiceId.replace('SR', ''), 10); // Extract numeric part
          const newNumericPart = numericPart + 1;
          newServiceId = `SR${newNumericPart.toString().padStart(2, '0')}`; // Generate "SRXX"
        }
      
        service.serviceId = newServiceId;
      
        // Populate address, locality, latitude, and longitude from ServiceProvider
        const { ServiceProvider } = sequelize.models; // Access the ServiceProvider model
        const serviceProvider = await ServiceProvider.findByPk(service.serviceProviderId);
      
        if (serviceProvider) {
          service.address = serviceProvider.address;
          service.locality = serviceProvider.locality;
          service.latitude = serviceProvider.latitude;
          service.longitude = serviceProvider.longitude;
        } else {
          throw new Error('Invalid serviceProviderId');
        }
      },
      
    },
  });

  // Define associations
  Service.associate = (models) => {
    // A service belongs to a single service provider
    Service.belongsTo(models.ServiceProvider, {
      foreignKey: 'serviceProviderId',
      as: 'serviceProvider',
    });
  };

  return Service;
};
