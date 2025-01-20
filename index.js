const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); // Import dotenv module to access .env file
const db = require('./models'); // Import models
const userRoutes = require('./routes/user.routes'); // Import user routes
const serviceProviderRoutes = require('./routes/serviceProvider.routes'); // Import serviceProvider routes
const serviceRoutes = require('./routes/service.routes'); // Import service routes
const bookingRoutes = require('./routes/booking.routes'); // Import booking routes
const paymentRoutes = require('./routes/payment.routes'); // Import payment routes
const reviewRoutes = require('./routes/review.routes'); // Import review routes
const adminRoutes = require('./routes/admin.routes'); // Import admin routes

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
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/admin', adminRoutes);



// Sync database and start server
db.sequelize.sync({force:false}).then(() => {
  app.listen(3002, () => {
    console.log('Server running on port 3002');
  });
}).catch((err) => {
  console.error('Failed to sync the database:', err);
});
