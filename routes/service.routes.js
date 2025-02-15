const express = require('express');
const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize.config');
const router = express.Router();
const { Service, ServiceProvider } = require('../models'); // Import models
const multer = require('multer');
const minioClient = require('../config/minio.config')


// Configure Multer for file handling
const storage = multer.memoryStorage(); // Store files in memory for direct upload
const upload = multer({ storage });

//const MINIO_PUBLIC_ENDPOINT = 'http://127.0.0.1:9001';
const MINIO_PUBLIC_ENDPOINT = 'http://localhost:9000'; // Match your MinIO setup
const authenticateToken = require('../middleware/authenticateToken')

// Create a new service
// router.post('/create', async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       category,
//       basePrice,
//       demoPics,
//       holidays,
//       isOpen,
//       serviceProviderId,
//       address,
//       locality,
//       latitude,
//       longitude,
//     } = req.body;

    // Check if the ServiceProvider exists
    // const serviceProvider = await ServiceProvider.findByPk(serviceProviderId);
    // if (!serviceProvider) {
    //   return res.status(404).json({ error: 'Service provider not found' });
    // }

    // Create the service
//     const newService = await Service.create({
//       title,
//       description,
//       category,
//       basePrice,
//       demoPics,
//       holidays,
//       isOpen,
//       serviceProviderId,
//       address,
//       locality,
//       latitude,
//       longitude,
//       status: 'pending' // Set initial status
//     });

//     res.status(201).json({ message: 'Service created successfully', service: newService });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


router.post('/create', upload.array('images', 5), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log('Service Data:', req.body.serviceData);
    const {
      title,
      description,
      category,
      basePrice,
      holidays,
      isOpen,
      serviceProviderId,
      address,
      locality,
      latitude,
      longitude,
    } = JSON.parse(req.body.serviceData);
    

    // Check if the ServiceProvider exists
    const serviceProvider = await ServiceProvider.findByPk(serviceProviderId);
    if (!serviceProvider) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Service provider not found' });
    }

    // Create the service first to get ID
    const newService = await Service.create({
      title,
      description,
      category,
      basePrice,
      serviceProviderId,
      address,
      locality,
      latitude,
      longitude,
      holidays,
      isOpen,
      status: 'pending'
    }, { transaction });

    // console.log('Created Service:', newService);
    // console.log('Service ID:', newService.id);
    //console.log('Service Datavalues:', newService.dataValues);

    const serviceId = newService.dataValues.serviceId;
    

    // Upload images to MinIO if present
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const fileName = `${serviceProviderId}/${serviceId}/${Date.now()}-${file.originalname}`;
          
          await minioClient.putObject('work-images', fileName, file.buffer, {
            'Content-Type': file.mimetype
          });

          return `${MINIO_PUBLIC_ENDPOINT}/work-images/${fileName}`;
        })
      );
    }

    // Update service with additional details and image URLs
    await newService.update({
      demoPics: JSON.stringify(imageUrls),
    }, { where: { serviceId: newService.dataValues.serviceId },
      transaction });

    await transaction.commit();

    res.status(201).json({ 
      message: 'Service created successfully', 
      service: newService,
      imageUrls: imageUrls
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Service creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an existing service
router.put('/update/:id', upload.array('images', 5), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const serviceData = JSON.parse(req.body.serviceData);
    const existingImages = JSON.parse(req.body.existingImages || '[]');

    // Ensure holidays is stored as JSON string in database
    if (serviceData.holidays && Array.isArray(serviceData.holidays)) {
      serviceData.holidays = JSON.stringify(serviceData.holidays);
    }

    // Find the service
    const service = await Service.findByPk(id);
    if (!service) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Service not found' });
    }

    // Handle new image uploads
    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      newImageUrls = await Promise.all(
        req.files.map(async (file) => {
          const fileName = `${serviceData.serviceProviderId}/${id}/${Date.now()}-${file.originalname}`;
          await minioClient.putObject('work-images', fileName, file.buffer, {
            'Content-Type': file.mimetype
          });
          return `${MINIO_PUBLIC_ENDPOINT}/work-images/${fileName}`;
        })
      );
    }

    // Combine existing and new image URLs
    const updatedDemoPics = [...existingImages, ...newImageUrls];

    // Update the service
    await service.update({
      ...serviceData,
      demoPics: JSON.stringify(updatedDemoPics),
    }, { transaction });

    await transaction.commit();
    res.status(200).json({ 
      message: 'Service updated successfully', 
      service: await service.reload()
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Service update error:', error);
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


router.get('/images/:serviceId', async (req, res) => {
  try {
    const service = await Service.findOne({ 
      where: { serviceId: req.params.serviceId } 
    });

    const imageUrls = service.demoPics 
      ? JSON.parse(service.demoPics) 
      : [];

    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// router.get('/images/:serviceId', async (req, res) => {
//   try {
//     // Find the service
//     const service = await Service.findOne({ 
//       where: { serviceId: req.params.serviceId } 
//     });

//     // Parse demo pics URLs
//     const imageUrls = service.demoPics 
//       ? JSON.parse(service.demoPics) 
//       : [];

//     // Fetch image buffers from Minio
//     const imageBuffers = await Promise.all(imageUrls.map(async (imagePath) => {
//       try {
//         // Assume bucket name is 'services'
//         const { data } = await minioClient.getObject('work-images', imagePath);
//         return data;
//       } catch (error) {
//         console.error(`Error fetching image ${imagePath}:`, error);
//         return null;
//       }
//     }));

//     // Filter out any null results (failed image fetches)
//     const validImageBuffers = imageBuffers.filter(buffer => buffer !== null);

//     // Send image buffers to frontend
//     res.json({ 
//       images: validImageBuffers.map(buffer => buffer.toString('base64')) 
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });




module.exports = router;
