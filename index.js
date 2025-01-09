const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); // Import dotenv module to access .env file
const db = require('./models'); // Import models
const userRoutes = require('./routes/user'); // Import user routes
const serviceProviderRoutes = require('./routes/serviceProvider'); // Import serviceProvider routes
const serviceRoutes = require('./routes/service'); // Import service routes


// CORS options
const corsOptions = {
  origin: 'http://localhost:5173',  // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true,  // Enable credentials (cookies, tokens, etc.)
};

// Enable CORS with options
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());


// Use the user routes
app.use('/users', userRoutes);
app.use('/serviceProviders', serviceProviderRoutes);
app.use('/services', serviceRoutes);



// Sync database and start server
db.sequelize.sync({force:false}).then(() => {
  app.listen(3002, () => {
    console.log('Server running on port 3002');
  });
}).catch((err) => {
  console.error('Failed to sync the database:', err);
});
