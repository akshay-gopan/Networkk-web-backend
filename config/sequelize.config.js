// const { Sequelize } = require('sequelize');

// // Create the Sequelize instance and connect to the database
// const sequelize = new Sequelize('Networkk', 'Root@1234', null, {
//   host: 'localhost',
//   dialect: 'mysql',  // Or whichever database you're using
// });

// module.exports = sequelize;


const { Sequelize } = require('sequelize');

// Load environment variables
require('dotenv').config();

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
});

module.exports = sequelize;
