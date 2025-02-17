const express = require('express');
const { Booking, Service, User, ServiceProvider, Payment } = require('../models');
const { sendBookingNotificationEmail } = require('../utils/emailService');
const router = express.Router();

// Create a new booking
router.post('/create', async (req, res) => {
  try {
    const { 
      bookingStatus, 
      paymentStatus, 
      basePayment, 
      description, 
      extraPayment, 
      isReview, 
      serviceId, 
      userId, 
      serviceProviderId,
      bookingDate,
      bookingTime
    } = req.body;

    // Create booking
    const newBooking = await Booking.create({
      bookingStatus,
      paymentStatus,
      basePayment,
      description,
      extraPayment,
      isReview,
      serviceId,
      userId,
      serviceProviderId,
      bookingDate,
      bookingTime,
    });

    // Fetch all required details
    const [service, user, serviceProvider] = await Promise.all([
      Service.findByPk(serviceId),
      User.findByPk(userId),
      ServiceProvider.findByPk(serviceProviderId)
    ]);

    if (serviceProvider && serviceProvider.email) {
      try {
        await sendBookingNotificationEmail(
          serviceProvider.email,
          {
            bookingId: newBooking.bookingId,
            bookingDate,
            bookingTime,
            description,
            basePayment,
            service: {
              id: service.serviceId,
              title: service.title,
              category: service.category
            },
            user: {
              id: user.userId,
              name: `${user.fname || ''} ${user.lname || ''}`.trim(),
              phone: user.phone,
              address: user.address
            }
          }
        );
      } catch (emailError) {
        console.error('Error sending booking notification email:', emailError);
      }
    }

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const bookings = await Booking.findAll({
      where: { userId: userId },
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'user' },
        { model: ServiceProvider, as: 'serviceProvider' },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']] // Most recent bookings first
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bookings',
      details: error.message 
    });
  }
});

// Add this new route to get bookings for a specific service provider
router.get('/provider', async (req, res) => {
  try {
    const { serviceProviderId } = req.query;
    
    if (!serviceProviderId) {
      return res.status(400).json({ error: 'serviceProviderId is required' });
    }

    const bookings = await Booking.findAll({
      where: { serviceProviderId: serviceProviderId },
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'user' },
        { model: ServiceProvider, as: 'serviceProvider' },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bookings',
      details: error.message 
    });
  }
});

// Get a specific booking by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByPk(id, {
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'user' },
        { model: ServiceProvider, as: 'serviceProvider' },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a booking
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    bookingStatus, 
    paymentStatus, 
    basePayment, 
    description, 
    extraPayment, 
    isReview,
    bookingDate,
    bookingTime 
  } = req.body;

  try {
    const [updated] = await Booking.update(
      { 
        bookingStatus, 
        paymentStatus, 
        basePayment, 
        description, 
        extraPayment, 
        isReview,
        bookingDate,
        bookingTime 
      },
      { where: { bookingId: id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updatedBooking = await Booking.findByPk(id);
    res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Booking.destroy({ where: { bookingId: id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;