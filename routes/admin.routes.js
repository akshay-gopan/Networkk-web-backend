const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, Service } = require('../models'); // Replace with the correct path to your Admin model
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken'); // Import JWT middleware

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


// Fetch all services with pending status
router.get('/pending-services', authenticateToken, async (req, res) => {
  try {
    // Ensure only admins can access this route (optional, if roles are implemented)
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Access denied. Only admins can view this resource.' });
    // }

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

router.put('/approve-service/:serviceId', authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if service exists
    const service = await Service.findByPk(serviceId);
    
    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    // Check if service is already approved
    if (service.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Service is already approved'
      });
    }

    // Update service status
    const updatedService = await service.update({
      status: 'accepted',
      //approvedAt: new Date(),
      //approvedBy: req.admin.id  // Assuming admin ID is available in req.admin
    });

    res.status(200).json({
      success: true,
      message: 'Service approved successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('Error approving service:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});


module.exports = router;
