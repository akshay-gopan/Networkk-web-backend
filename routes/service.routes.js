const express = require('express');
const router = express.Router();
const { Service, ServiceProvider } = require('../models'); // Import models

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

module.exports = router;
