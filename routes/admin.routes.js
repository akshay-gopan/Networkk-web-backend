const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models'); // Replace with the correct path to your Admin model
const router = express.Router();

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Sign-in route for admin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin exists
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: admin.adminId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour);

    // Respond with the token and admin details
    res.status(200).json({
      message: 'Sign-in successful',
      token,
      admin: {
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
