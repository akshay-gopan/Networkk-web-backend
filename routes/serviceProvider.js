const express = require('express');
const router = express.Router();
const { ServiceProvider } = require('../models'); // Import your ServiceProvider model

// Create a new service provider
router.post('/create', async (req, res) => {
  try {
    const newServiceProvider = await ServiceProvider.create(req.body); // Automatically hashes password in model hooks
    res.status(201).json(newServiceProvider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all service providers
router.get('/', async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.findAll();
    res.status(200).json(serviceProviders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a service provider by ID
router.get('/:id', async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findByPk(req.params.id);
    if (serviceProvider) {
      res.status(200).json(serviceProvider);
    } else {
      res.status(404).json({ error: 'Service provider not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a service provider
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await ServiceProvider.update(req.body, {
      where: { serviceProviderId: req.params.id },
    });
    if (updated) {
      const updatedServiceProvider = await ServiceProvider.findByPk(req.params.id);
      res.status(200).json(updatedServiceProvider);
    } else {
      res.status(404).json({ error: 'Service provider not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a service provider
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ServiceProvider.destroy({
      where: { serviceProviderId: req.params.id },
    });
    if (deleted) {
      res.status(200).json({ message: 'Service provider deleted' });
    } else {
      res.status(404).json({ error: 'Service provider not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
