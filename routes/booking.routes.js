const express = require('express');
const { Booking, Service, User, ServiceProvider, Payment } = require('../models'); // Import models
const router = express.Router();

// Create a new booking
router.post('/create', async (req, res) => {
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

  try {
    // Create a new booking entry
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

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'user' },
        { model: ServiceProvider, as: 'serviceProvider' },
        { model: Payment, as: 'payment' },
      ],
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Get accepted bookings by userId
router.get('/pending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const pendingBookings = await Booking.findAll({
      where: {
        userId: userId,
        bookingStatus: 'pending'
      },
      include: [
        {
          model: Service,
          attributes: ['id', 'title', 'description', 'basePrice'],
          include: [{
            model: ServiceProvider,
            attributes: ['id', 'fname', 'lname', 'phone']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!pendingBookings || pendingBookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending bookings found'
      });
    }

    res.status(200).json({
      success: true,
      count: pendingBookings.length,
      bookings: pendingBookings
    });

  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending bookings',
      error: error.message
    });
  }
});

router.get('/confirmed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const confirmedBookings = await Booking.findAll({
      where: {
        userId: userId,
        bookingStatus: 'confirmed'
      },
      include: [
        {
          model: Service,
          attributes: ['id', 'title', 'description', 'basePrice'],
          include: [{
            model: ServiceProvider,
            attributes: ['id', 'fname', 'lname', 'phone']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!confirmedBookings || confirmedBookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No confirmed bookings found'
      });
    }

    res.status(200).json({
      success: true,
      count: confirmedBookings.length,
      bookings: confirmedBookings
    });

  } catch (error) {
    console.error('Error fetching confirmed bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching confirmed bookings',
      error: error.message
    });
  }
});

router.get('/rejected/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const rejectedBookings = await Booking.findAll({
      where: {
        userId: userId,
        bookingStatus: 'rejected'
      },
      include: [
        {
          model: Service,
          attributes: ['id', 'title', 'description', 'basePrice'],
          include: [{
            model: ServiceProvider,
            attributes: ['id', 'fname', 'lname', 'phone']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!rejectedBookings || rejectedBookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No completed bookings found'
      });
    }

    res.status(200).json({
      success: true,
      count: rejectedBookings.length,
      bookings: rejectedBookings
    });

  } catch (error) {
    console.error('Error fetching rejected bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rejected bookings',
      error: error.message
    });
  }
});

module.exports = router;