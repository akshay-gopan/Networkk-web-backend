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
      bookingTime
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

module.exports = router;
