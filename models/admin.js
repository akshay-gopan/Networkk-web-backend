const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const Admin = sequelize.define(
    'Admin',
    {
      adminId: {
        type: DataTypes.STRING, // Custom ID with "ADXX" format
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('superadmin', 'moderator'), // Admin roles
        allowNull: false,
        defaultValue: 'moderator',
      },
    },
    {
      tableName: 'admins',
      timestamps: true,
      hooks: {
        // Generate "AD0XX" adminId before creating a new admin
        beforeCreate: async (admin) => {
          const lastAdmin = await Admin.findOne({
            order: [['createdAt', 'DESC']],
          });

          let newAdminId = 'AD01'; // Default first admin ID if no admins exist

          if (lastAdmin && lastAdmin.adminId) {
            const lastAdminId = lastAdmin.adminId;
            const numericPart = parseInt(lastAdminId.replace('AD', ''), 10);
            const newNumericPart = numericPart + 1;
            newAdminId = 'AD' + newNumericPart.toString().padStart(2, '0');
          }

          admin.adminId = newAdminId;

          // Hash password before saving
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        },
        // Hash password before updating, if changed
        beforeUpdate: async (admin) => {
          if (admin.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
          }
        },
      },
    }
  );

  return Admin;
};
