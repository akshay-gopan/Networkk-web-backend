const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, Service, ServiceProvider } = require('../models'); // Replace with the correct path to your Admin model
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken'); // Import JWT middleware
const emailService = require('../services/emailService');

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
    });

    await emailService.sendServiceApprovalEmail({
      email: service.serviceProvider.email,
      name: service.serviceProvider.name,
      serviceName: service.title
  });

    res.status(200).json({
      success: true,
      message: 'Service approved successfully and notification sent',
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



router.put('/reject-service/:serviceId', authenticateToken, async (req, res) => {
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
    if (service.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Service is already rejected'
      });
    }

    // Update service status
    const updatedService = await service.update({
      status: 'rejected',
    });

    res.status(200).json({
      success: true,
      message: 'Service was rejected',
      service: updatedService
    });
  } catch (error) {
    console.error('Error rejecting service:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Add new status update endpoint
router.put('/services/:serviceId/status', authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const service = await Service.findByPk(serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const updatedService = await service.update({ status });

    res.status(200).json({
      success: true,
      message: `Service ${status} successfully`,
      service: updatedService
    });

  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
