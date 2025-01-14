const express = require('express');
const { Payment, Booking } = require('../models'); // Import models
const router = express.Router();

// Create a new payment
router.post('/create', async (req, res) => {
  const { bookingId, paymentStatus, paymentMode, paymentAmount, paymentDate, paymentTime, paymentDesc } = req.body;

  try {
    // Check if the bookingId exists
    const bookingExists = await Booking.findByPk(bookingId);
    if (!bookingExists) {
      return res.status(404).json({ error: `Booking ID ${bookingId} does not exist` });
    }

    // Create the payment
    const newPayment = await Payment.create({
      bookingId,
      paymentStatus,
      paymentMode,
      paymentAmount,
      paymentDate,
      paymentTime,
      paymentDesc,
    });

    res.status(201).json({ message: 'Payment created successfully', payment: newPayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: Booking, as: 'booking' }], // Include booking details
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific payment by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payment.findByPk(id, {
      include: [{ model: Booking, as: 'booking' }], // Include booking details
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a payment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, paymentMode, paymentAmount, paymentDate, paymentTime, paymentDesc } = req.body;

  try {
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update the payment details
    payment.paymentStatus = paymentStatus || payment.paymentStatus;
    payment.paymentMode = paymentMode || payment.paymentMode;
    payment.paymentAmount = paymentAmount || payment.paymentAmount;
    payment.paymentDate = paymentDate || payment.paymentDate;
    payment.paymentTime = paymentTime || payment.paymentTime;
    payment.paymentDesc = paymentDesc || payment.paymentDesc;

    await payment.save();

    res.status(200).json({ message: 'Payment updated successfully', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a payment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Payment.destroy({
      where: { paymentId: id },
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
