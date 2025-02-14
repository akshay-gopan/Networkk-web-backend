const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    bookingId: {
      type: DataTypes.STRING, // Custom "BK0XX" format for booking IDs
      primaryKey: true,
    },
    serviceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bookingStatus: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    basePayment: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    extraPayment: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    isReview: {
      type: DataTypes.BOOLEAN,
      defaultValue: 'null',
      defaultValue: true,
    },
    servprovLocality: {
      type: DataTypes.STRING(100),
      allowNull: true, // Dynamically filled from the ServiceProvider table
      
    },
    userLocality: {
      type: DataTypes.STRING(100),
      allowNull: true, // Dynamically filled from the User table
    },
    bookingDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    bookingTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
  }, {
    tableName: 'bookings',
    timestamps: true,
    hooks: {
      beforeCreate: async (booking, options) => {
        // Generate "BK0XX" format for bookingId
        const lastBooking = await Booking.findOne({ order: [['createdAt', 'DESC']] });
        let newBookingId = 'BK01';
        if (lastBooking && lastBooking.bookingId) {
          const lastBookingId = lastBooking.bookingId;
          const numericPart = parseInt(lastBookingId.replace('BK', ''), 10);
          const newNumericPart = numericPart + 1;
          newBookingId = `BK${newNumericPart.toString().padStart(2, '0')}`;
        }
        booking.bookingId = newBookingId;

        // Fetch and populate service provider locality
        const { ServiceProvider, User } = sequelize.models;

        const serviceProvider = await ServiceProvider.findByPk(booking.serviceProviderId);
        if (serviceProvider) {
          booking.servprovLocality = serviceProvider.locality;
        } else {
          throw new Error('Invalid serviceProviderId');
        }

        // Fetch and populate user locality
        const user = await User.findByPk(booking.userId);
        if (user) {
          booking.userLocality = user.locality;
        } else {
          throw new Error('Invalid userId');
        }

      },
    },
  });

  //Define associations
  Booking.associate = (models) => {
    Booking.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service',
    });
    Booking.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Booking.belongsTo(models.ServiceProvider, {
      foreignKey: 'serviceProviderId',
      as: 'serviceProvider',
    });
    Booking.hasOne(models.Payment, {
      foreignKey: 'bookingId',
      as: 'payment'
    });
  };

  return Booking;
};
