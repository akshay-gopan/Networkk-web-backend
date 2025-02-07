const express = require('express');
const multer = require('multer');
const router = express.Router();
const minioClient = require('../config/minio.config')
const { Service } = require('../models'); // Import models

// Configure Multer for file handling
const storage = multer.memoryStorage(); // Store files in memory for direct upload
const upload = multer({ storage });

// Upload a file to MinIO
// router.post('/upload', upload.single('file'), async (req, res) => {
//   console.log('Route hit:', req.body, req.file);
//   try {
//     const bucketName = req.body.bucketName; // Pass the bucket name in the request body
//     const fileName = req.file.originalname; // Get file name
//     const fileBuffer = req.file.buffer;    // Get file buffer

//     // Upload file to MinIO bucket
//     await minioClient.putObject(bucketName, fileName, fileBuffer);
//     res.status(200).json({ message: 'File uploaded successfully', fileName });
//   } catch (error) {
//     console.error('Error uploading file:', error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

router.post('/upload-service-images', upload.array('images', 5), async (req, res) => {
  try {
    const { serprovId } = req.body;
    const files = req.files;

    // Validate inputs
    if (!serprovId || !files || files.length === 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Upload images with userId-specific path
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const fileName = `${serprovId}/${Date.now()}-${file.originalname}`;
        
        // Upload to work-images bucket with userId path
        await minioClient.putObject('work-images', fileName, file.buffer, {
          'Content-Type': file.mimetype
        });

        // Generate permanent URL
        return `${MINIO_PUBLIC_ENDPOINT}/work-images/${fileName}`;
      })
    );

    // Update Service table
    const service = await Service.findByPk(serprovId);
    if (!service) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    // Merge new URLs with existing (if any)
    const existingUrls = service.demoPics ? JSON.parse(service.demoPics) : [];
    const updatedUrls = [...existingUrls, ...imageUrls];

    // Update demoPics column with new URLs
    await service.update({ 
      demoPics: JSON.stringify(updatedUrls) 
    });

    res.status(200).json({ 
      message: 'Images uploaded successfully', 
      imageUrls: updatedUrls 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});


module.exports = router;

