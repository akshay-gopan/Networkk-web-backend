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

const MINIO_PUBLIC_ENDPOINT = 'http://127.0.0.1:9001';


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
    // console.log('Service Datavalues:', newService.dataValues);


    const serviceId = newService.dataValues.serviceId;

    // Upload images to MinIO if present
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          //serviceId = newService.id;
          const fileName = `${serviceId}/${Date.now()}-${file.originalname}`;
          
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
    }, { transaction });

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

module.exports = router;
