const express = require('express');
const app = express();
require('dotenv').config(); // Import dotenv module to access .env file
const db = require('./models'); // Import models
const userRoutes = require('./routes/user'); // Import user routes
const serviceProviderRoutes = require('./routes/serviceProvider'); // Import serviceProvider routes


// Middleware to parse JSON requests
app.use(express.json());

// Use the user routes
app.use('/users', userRoutes);
app.use('/serviceProviders', serviceProviderRoutes);



// Sync database and start server
db.sequelize.sync({force:false}).then(() => {
  app.listen(3002, () => {
    console.log('Server running on port 3002');
  });
}).catch((err) => {
  console.error('Failed to sync the database:', err);
});
