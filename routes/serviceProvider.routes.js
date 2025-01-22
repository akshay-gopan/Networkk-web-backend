const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ServiceProvider } = require('../models'); // Import your ServiceProvider model
const authenticateToken = require('../middleware/authenticateToken'); // JWT middleware
const router = express.Router();

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Sign-up route (Create an account)
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the service provider already exists
    const existingServiceProvider = await ServiceProvider.findOne({ where: { email } });
    if (existingServiceProvider) {
      return res.status(400).json({ message: 'Service provider already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the service provider with all details
    // const newServiceProvider = await ServiceProvider.create({
    //   ...req.body,
    //   password: hashedPassword,
    // });

    //Create the service provider with email and password
    const newServiceProvider = await ServiceProvider.create({ email, password: hashedPassword });

    // Generate a JWT token
    const token = jwt.sign({ id: newServiceProvider.serviceProviderId }, JWT_SECRET, { expiresIn: '1h' });
    
        //Send the token to the client
    res.status(201).json({ message: 'Service provider created successfully', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign-in route (Login)
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the service provider by email
    const serviceProvider = await ServiceProvider.findOne({ where: { email } });
    console.log("service provider exist");
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // Compare the password
    const isPasswordValid = bcrypt.compare(password, serviceProvider.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: serviceProvider.serviceProviderId }, JWT_SECRET, { expiresIn: '1h' });

    // Send the token to the client
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findByPk(req.user.id);
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(serviceProvider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Profile updation route (Protected by JWT)
router.put('/profile', authenticateToken, async (req, res) => {
  const { 
    fname, lname, address, latitude, longitude, locality, 
    phone, username, aadhaar, languages, skills, 
    experience, completedJobs 
  } = req.body;

  try {
    const serviceProvider = await ServiceProvider.findByPk(req.user.id);

    if (!serviceProvider) {
      return res.status(404).json({ message: 'ServiceProvider not found' });
    }

    // Update basic fields
    serviceProvider.fname = fname || serviceProvider.fname;
    serviceProvider.lname = lname || serviceProvider.lname;
    serviceProvider.address = address || serviceProvider.address;
    serviceProvider.latitude = latitude || serviceProvider.latitude;
    serviceProvider.longitude = longitude || serviceProvider.longitude;
    serviceProvider.locality = locality || serviceProvider.locality;
    serviceProvider.phone = phone || serviceProvider.phone;
    serviceProvider.username = username || serviceProvider.username;
    serviceProvider.aadhaar = aadhaar || serviceProvider.aadhaar;

    // Update JSON fields
    if (languages) serviceProvider.languages = languages;
    if (skills) serviceProvider.skills = skills;
    if (experience) serviceProvider.experience = experience;
    if (completedJobs) serviceProvider.completedJobs = completedJobs;

    await serviceProvider.save();
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      serviceProvider 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all service providers (no authentication needed)
router.get('/', async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.findAll();
    res.status(200).json(serviceProviders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a service provider by ID (no authentication needed)
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

// Update a service provider (Protected by JWT)
router.put('/:id', authenticateToken, async (req, res) => {
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

// Delete a service provider (Protected by JWT)
router.delete('/:id', authenticateToken, async (req, res) => {
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

// Add new route to update specific JSON fields
router.patch('/profile/fields', authenticateToken, async (req, res) => {
  const { field, data } = req.body;

  try {
    const serviceProvider = await ServiceProvider.findByPk(req.user.id);

    if (!serviceProvider) {
      return res.status(404).json({ message: 'ServiceProvider not found' });
    }

    // Validate field name
    const validFields = ['languages', 'skills', 'experience', 'completedJobs'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field name' });
    }

    // Update specific field
    serviceProvider[field] = data;
    await serviceProvider.save();

    res.status(200).json({
      message: `${field} updated successfully`,
      [field]: serviceProvider[field]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
