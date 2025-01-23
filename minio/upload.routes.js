const express = require('express');
const multer = require('multer');
const router = express.Router();
const minioClient = require('../config/minio.config')

// Configure Multer for file handling
const storage = multer.memoryStorage(); // Store files in memory for direct upload
const upload = multer({ storage });

// Upload a file to MinIO
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Route hit:', req.body, req.file);
  try {
    const bucketName = req.body.bucketName; // Pass the bucket name in the request body
    const fileName = req.file.originalname; // Get file name
    const fileBuffer = req.file.buffer;    // Get file buffer

    // Upload file to MinIO bucket
    await minioClient.putObject(bucketName, fileName, fileBuffer);
    res.status(200).json({ message: 'File uploaded successfully', fileName });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
