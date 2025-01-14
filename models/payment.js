const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    'Payment',
    {
      paymentId: {
        type: DataTypes.STRING, // Custom "PY0XX" format for payment IDs
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'bookings', // Reference the bookings table
          key: 'bookingId',
        },
        onDelete: 'CASCADE', // If the booking is deleted, delete related payment
        onUpdate: 'CASCADE', // Update foreign key on booking ID change
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
      },
      paymentMode: {
        type: DataTypes.ENUM('card', 'upi'),
        allowNull: false,
      },
      paymentAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      paymentTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      paymentDesc: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'payments',
      timestamps: true,
      hooks: {
        // Generate "PY0XX" format for paymentId
        beforeCreate: async (payment, options) => {
          const lastPayment = await Payment.findOne({
            order: [['createdAt', 'DESC']],
          });
          let newPaymentId = 'PY01';
          if (lastPayment && lastPayment.paymentId) {
            const lastPaymentId = lastPayment.paymentId;
            const numericPart = parseInt(lastPaymentId.replace('PY', ''), 10);
            const newNumericPart = numericPart + 1;
            newPaymentId = 'PY' + newNumericPart.toString().padStart(2, '0');
          }
          payment.paymentId = newPaymentId;

          // Check if bookingId exists in the bookings table
          const { Booking } = sequelize.models; // Access the Booking model
          const bookingExists = await Booking.findByPk(payment.bookingId);
          if (!bookingExists) {
            throw new Error(`Booking ID ${payment.bookingId} does not exist`);
          }
        },
      },
    }
  );

  // Define associations
  Payment.associate = (models) => {
    Payment.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
    });
  };

  return Payment;
};
