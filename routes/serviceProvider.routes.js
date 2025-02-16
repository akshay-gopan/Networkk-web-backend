const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ServiceProvider } = require('../models'); // Import your ServiceProvider model
const authenticateToken = require('../middleware/authenticateToken'); // JWT middleware
const router = express.Router();
const multer = require('multer');
const minioClient = require('../config/minio.config')

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET ;

// Configure Multer for file handling
const storage = multer.memoryStorage(); // Store files in memory for direct upload
const upload = multer({ storage });
const MINIO_PUBLIC_ENDPOINT = 'http://localhost:9000'; // Match your MinIO setup


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
    const serviceProvider = await ServiceProvider.findOne({ where: { email } });
    if (!serviceProvider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const isPasswordValid = bcrypt.compare(password, serviceProvider.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: serviceProvider.serviceProviderId }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'Login successful', 
      token,
      userId: serviceProvider.serviceProviderId  // Add userId to response
    });
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

router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const provider = await ServiceProvider.findOne({
      where: { email: email }
    });
    
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }
    
    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile update route (Protected by JWT)
router.put('/profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const { 
      fname, lname, address, latitude, longitude, locality, 
      phone, username, aadhaar, languages, skills, experience,
      link // Add this line
    } = req.body;
    
    const serviceProvider = await ServiceProvider.findByPk(req.user.id);

    if (!serviceProvider) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profilePictureUrl = serviceProvider.profilePicture;

    // Handle image upload if file exists
    if (req.file) {
      try {
        // Create unique filename
        const fileName = `serviceProviders/${req.user.id}/${Date.now()}.${req.file.originalname.split('.').pop()}`;
        
        // Check and create bucket
        const bucketExists = await minioClient.bucketExists('profile-pictures');
        console.log("Bucket exists:", bucketExists);
        if (!bucketExists) {
          await minioClient.makeBucket('profile-pictures');
        }

        // Upload to MinIO
        await minioClient.putObject(
          'profile-pictures',
          fileName,
          req.file.buffer,
          req.file.buffer.length,
          { 'Content-Type': req.file.mimetype }
        );

        // Generate URL
        profilePictureUrl = `${MINIO_PUBLIC_ENDPOINT}/profile-pictures/${fileName}`;
        
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image',
          error: uploadError.message 
        });
      }
    }

    // Update provider details including new fields
    const updatedProvider = await serviceProvider.update({
      fname: fname || serviceProvider.fname,
      lname: lname || serviceProvider.lname,
      address: address || serviceProvider.address,
      latitude: latitude || serviceProvider.latitude,
      longitude: longitude || serviceProvider.longitude,
      locality: locality || serviceProvider.locality,
      phone: phone || serviceProvider.phone,
      username: username || serviceProvider.username,
      aadhaar: aadhaar || serviceProvider.aadhaar,
      languages: languages || serviceProvider.languages,
      skills: skills || serviceProvider.skills,
      experience: experience || serviceProvider.experience,
      link: link || serviceProvider.link, // Add this line
      profilePicture: profilePictureUrl
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      serviceProvider: updatedProvider
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

//Fetch the current user (Protected by JWT)
router.get('/d/me', authenticateToken, async (req, res) => {
  
  try {
    const serviceProvider = await ServiceProvider.findByPk(req.user.id); // Fetch serviceProvider by ID
    console.log("User:", serviceProvider); // Debug log
    if (serviceProvider) {
      res.status(200).json(serviceProvider);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get all service providers (no authentication needed)
router.get('/', authenticateToken, async (req, res) => {
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

module.exports = router;
