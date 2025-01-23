const { DataTypes } = require('sequelize');
const service = require('./service');

module.exports = (sequelize) => {
  const Review = sequelize.define(
    'Review',
    {
      reviewId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      serviceId: {
        type: DataTypes.STRING,
        allowNull: false, // Service ID is required
        references: {
            model: 'services',
            key: 'serviceId',
        },
        onDelete: 'CASCADE',
      },
        userId: {
            type: DataTypes.STRING,
            allowNull: false, // User ID is required
            references: {
                model: 'users',
                key: 'userId',
            },
            onDelete: 'CASCADE',
        },
        bookingId: {
            type: DataTypes.STRING,
            allowNull: false, // Booking ID is required
            references: {
                model: 'bookings',
                key: 'bookingId',
            },
            onDelete: 'CASCADE',
        },
      description: {
        type: DataTypes.TEXT,
        allowNull: true, // Allow reviews without descriptions
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false, // Rating is required
        validate: {
          min: 1, // Minimum rating value
          max: 5, // Maximum rating value
        },
      },
    },
    {
      tableName: 'reviews',
      timestamps: true, // Enable createdAt and updatedAt fields
      hooks: {
        // Generate "RVXX" format for reviewId
        beforeCreate: async (review, options) => {
          const lastReview = await Review.findOne({
            order: [['createdAt', 'DESC']],
          });
          let newReviewId = 'RV01';
          if (lastReview && lastReview.reviewId) {
            const lastReviewId = lastReview.reviewId;
            const numericPart = parseInt(lastReviewId.replace('RV', ''), 10);
            const newNumericPart = numericPart + 1;
            newReviewId = 'RV' + newNumericPart.toString().padStart(2, '0');
          }
          review.reviewId = newReviewId;

          const { Service } = sequelize.models;
            const serviceExist = await Service.findByPk(review.serviceId);
            if (!serviceExist) {
              throw new Error('Service does not exist');
            }
        },
      }
    }
  );

  // Define associations
  Review.associate = (models) => {
    // Relation with Booking
    Review.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
    });

    // Relation with Service
    Review.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service',
    });

    // Relation with User
    Review.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Review;
};
