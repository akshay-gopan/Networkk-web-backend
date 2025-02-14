const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Import your User model
const authenticateToken = require('../middleware/authenticateToken'); // Import JWT middleware
const router = express.Router();
const multer = require('multer');
const minioClient = require('../config/minio.config')


// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET ;

// Configure Multer for file handling
const storage = multer.memoryStorage(); // Store files in memory for direct upload
const upload = multer({ storage });
const MINIO_PUBLIC_ENDPOINT = 'http://localhost:9000'; // Match your MinIO setup


// Sign-up route (Register and log in)
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({ email, password: hashedPassword });

    // Generate a JWT token
    const token = jwt.sign({ id: newUser.userId }, JWT_SECRET, { expiresIn: '1h' });

    // Send the token to the client
    res.status(201).json({ 
      message: 'User created successfully', 
      token,
      userId: newUser.userId  // Add userId to response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Sign-in route (Login)
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    console.log("user exist");
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

     //console.log("Entered password:", password);
     //console.log("Stored hashed password:", user.password);

    // Compare the password
    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password',  });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    // Send the token to the client
    res.status(200).json({ 
      message: 'Login successful', 
      token,
      userId: user.userId  // Add userId to response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile update route (Protected by JWT)
// router.put('/profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
//   const { fname, lname, address, latitude, longitude, locality, phone, username, aadhaar } = req.body;

//   try {
//     // Find the authenticated user by ID (from JWT token)
//     const user = await User.findByPk(req.user.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update user profile details
//     user.fname = fname || user.fname;
//     user.lname = lname || user.lname;
//     user.address = address || user.address;
//     user.latitude = latitude || user.latitude;
//     user.longitude = longitude || user.longitude;
//     user.locality = locality || user.locality;
//     user.phone = phone || user.phone;
//     user.username = username || user.username;
//     user.aadhaar = aadhaar || user.aadhaar;

//     // If the user is updating their password, hash it before saving
//     // if (password) {
//     //   user.password = await bcrypt.hash(password, 10);
//     // }

//     await user.save();
//     res.status(200).json({ message: 'Profile updated successfully', user });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.put('/profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const { fname, lname, address, latitude, longitude, locality, phone, username, aadhaar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profilePictureUrl = user.profilePicture;

    // Handle image upload if file exists
    if (req.file) {
      try {
        // Create unique filename
        const fileName = `users/${req.user.id}/${Date.now()}.${req.file.originalname.split('.').pop()}`;
        
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

    // Update provider details including profile picture URL
    const updatedProvider = await user.update({
      fname: fname || user.fname,
      lname: lname || user.lname,
      address: address || user.address,
      latitude: latitude || user.latitude,
      longitude: longitude || user.longitude,
      locality: locality || user.locality,
      phone: phone || user.phone,
      username: username || user.username,
      aadhaar: aadhaar || user.aadhaar,
      profilePicture: profilePictureUrl
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedProvider
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


// Get all users (Protected by JWT)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a user by ID (Protected by JWT)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Fetch the current user (Protected by JWT)
router.get('/d/me', authenticateToken, async (req, res) => {
  
  try {
    console.log("User ID from token:", req.user.id); // Debug log

    const user = await User.findByPk(req.user.id); // Fetch user by ID
    console.log("User:", user); // Debug log
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add favorite service/provider
router.post('/favorites', authenticateToken, async (req, res) => {
  const { type, id } = req.body; // type can be 'services' or 'providers'
  
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favorites = user.favorites || { services: [], providers: [] };
    if (!favorites[type].includes(id)) {
      favorites[type].push(id);
      await user.update({ favorites });
    }

    res.status(200).json({ message: 'Favorite added successfully', favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from favorites
router.delete('/favorites', authenticateToken, async (req, res) => {
  const { type, id } = req.body;
  
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favorites = user.favorites;
    favorites[type] = favorites[type].filter(itemId => itemId !== id);
    await user.update({ favorites });

    res.status(200).json({ message: 'Favorite removed successfully', favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user favorites
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user (Protected by JWT)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { userId: req.params.id },
    });

    if (updated) {
      const updatedUser = await User.findByPk(req.params.id);
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user (Protected by JWT)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { userId: req.params.id },
    });

    if (deleted) {
      res.status(200).json({ message: 'User deleted' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
