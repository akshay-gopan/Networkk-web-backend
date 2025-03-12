const express = require('express');
const { Review, Booking, Service, User } = require('../models'); // Import models
const router = express.Router();

// Create a new review
router.post('/create', async (req, res) => {
  const { serviceId, userId, bookingId, description, rating } = req.body;

  try {
    // Validate foreign keys
    const serviceExists = await Service.findByPk(serviceId);
    if (!serviceExists) {
      return res.status(404).json({ error: `Service ID ${serviceId} does not exist` });
    }

    const userExists = await User.findByPk(userId);
    if (!userExists) {
      return res.status(404).json({ error: `User ID ${userId} does not exist` });
    }

    const bookingExists = await Booking.findByPk(bookingId);
    if (!bookingExists) {
      return res.status(404).json({ error: `Booking ID ${bookingId} does not exist` });
    }

    // Create the review with initial status as 'completed'
    const newReview = await Review.create({
      serviceId,
      userId,
      bookingId,
      description,
      rating,
      status: 'completed' // Set initial status to completed
    });

    res.status(201).json({ message: 'Review created successfully', review: newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: Booking, as: 'booking' },
        { model: Service, as: 'service' },
        { model: User, as: 'user' },
      ],
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific review by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.findByPk(id, {
      include: [
        { model: Booking, as: 'booking' },
        { model: Service, as: 'service' },
        { model: User, as: 'user' }
      ]
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a review
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, rating } = req.body;

  try {
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.update({
      description: description || review.description,
      rating: rating || review.rating
    });

    res.status(200).json({ 
      message: 'Review updated successfully', 
      review 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a review
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.destroy();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get reviews by serviceId
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    if (!serviceId) {
      return res.status(400).json({ 
        success: false,
        message: 'Service ID is required' 
      });
    }

    // Verify service exists
    const serviceExists = await Service.findByPk(serviceId);
    if (!serviceExists) {
      return res.status(404).json({ 
        success: false,
        message: `Service with ID ${serviceId} not found` 
      });
    }

    // Get all reviews for the service
    const reviews = await Review.findAll({
      where: { serviceId: serviceId },
      include: [
        { model: User, as: 'user', attributes: ['userId', 'fname', 'lname', 'profilePicture'] },
        { model: Booking, as: 'booking', attributes: ['bookingId', 'bookingDate', 'bookingTime'] }
      ],
      order: [['createdAt', 'DESC']], // Newest reviews first
      attributes: ['reviewId', 'rating', 'description', 'createdAt', 'status']
    });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: parseFloat(averageRating),
      reviews: reviews
    });
    
  } catch (error) {
    console.error('Error fetching reviews by service:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
});

module.exports = router;
