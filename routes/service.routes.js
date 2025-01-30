const express = require('express');
const router = express.Router();
const { Service, ServiceProvider } = require('../models'); // Import models
const authenticateToken = require('../middleware/authenticateToken')

// Create a new service
router.post('/create', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      basePrice,
      demoPics,
      holidays,
      isOpen,
      serviceProviderId,
      address,
      locality,
      latitude,
      longitude,
    } = req.body;

    // Check if the ServiceProvider exists
    const serviceProvider = await ServiceProvider.findByPk(serviceProviderId);
    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    // Create the service
    const newService = await Service.create({
      title,
      description,
      category,
      basePrice,
      demoPics,
      holidays,
      isOpen,
      serviceProviderId,
      address,
      locality,
      latitude,
      longitude,
      status: 'pending' // Set initial status
    });

    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing service
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      basePrice,
      demoPics,
      holidays,
      isOpen,
      address,
      locality,
      latitude,
      longitude,
    } = req.body;

    // Find the service by ID
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Update the service
    await service.update({
      title,
      description,
      category,
      basePrice,
      demoPics,
      holidays,
      isOpen,
      address,
      locality,
      latitude,
      longitude,
    });

    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the service by ID
    const service = await Service.findByPk(id, {
      include: [{ model: ServiceProvider, as: 'serviceProvider' }], // Include service provider details
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [{ model: ServiceProvider, as: 'serviceProvider' }], // Include service provider details
    });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get services by provider ID
router.get('/provider/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const services = await Service.findAll({
      where: { serviceProviderId: id },
      include: [{ model: ServiceProvider, as: 'serviceProvider' }],
    });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a service
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the service by ID
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Delete the service
    await service.destroy();
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new status update route
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await service.update({ status });
    res.status(200).json({ message: 'Service status updated successfully', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Fetch all services with accepted status
router.get('/accepted', authenticateToken, async (req, res) => {
  try {

    // Fetch all services with a accepted status
    const acceptedServices = await Service.findAll({
      where: { status: 'accepted' }, // 'status' column in the `services` table
      order: [['createdAt', 'DESC']], // Optional: Sort by newest first
    });

    if (acceptedServices.length === 0) {
      return res.status(404).json({ message: 'No accepted services found.' });
    }

    res.status(200).json(acceptedServices);
  } catch (error) {
    console.error('Error fetching accepted services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch all services with pending status
router.get('/pending', authenticateToken, async (req, res) => {
  try {

    // Fetch all services with a pending status
    const pendingServices = await Service.findAll({
      where: { status: 'pending' }, // Assuming 'status' is a column in the `services` table
      order: [['createdAt', 'DESC']], // Optional: Sort by newest first
    });

    if (pendingServices.length === 0) {
      return res.status(404).json({ message: 'No pending services found.' });
    }

    res.status(200).json(pendingServices);
  } catch (error) {
    console.error('Error fetching pending services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/rejected', authenticateToken, async (req, res) => {
  try {

    // Fetch all services with a pending status
    const rejectedServices = await Service.findAll({
      where: { status: 'rejected' }, // Assuming 'status' is a column in the `services` table
      order: [['createdAt', 'DESC']], // Optional: Sort by newest first
    });

    if (rejectedServices.length === 0) {
      return res.status(404).json({ message: 'No rejected services found.' });
    }

    res.status(200).json(rejectedServices);
  } catch (error) {
    console.error('Error fetching rejected services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




router.get('/holiday/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    const service = await Service.findOne({
      where: {
        serviceId: serviceId,
      },
      attributes: ['holidays'] // Only fetch holidays array
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    res.status(200).json({
      success: true,
      data: service.holidays
    });

  } catch (error) {
    console.error('Error fetching holiday details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});


module.exports = router;
