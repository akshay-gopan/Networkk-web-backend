const express = require('express');
const minioClient = require('../config/minio.config');
const router = express.Router();
require('dotenv').config();

const MINIO_PUBLIC_ENDPOINT = 'http://127.0.0.1:9001';

// Download a file from MinIO
router.get('/download', async (req, res) => {
  const { bucketName, fileName } = req.query; // Pass bucket name and file name as query params

  try {
    // Get file as a stream
    const fileStream = await minioClient.getObject(bucketName, fileName);

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Pipe the file stream to the response
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get permanent URL for a file
router.get('/getImageUrl', async (req, res) => {
    const { bucketName, fileName } = req.query;
  
    try {
      // Validate parameters
      if (!bucketName || !fileName) {
        return res.status(400).json({ 
          error: 'Bucket name and file name are required' 
        });
      }
  
      // Check if object exists
      await minioClient.statObject(bucketName, fileName);
  
      // Generate permanent URL
      const permanentUrl = `${MINIO_PUBLIC_ENDPOINT}/${bucketName}/${fileName}`;
  
      // Make bucket public if not already
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  
      res.json({
        url: permanentUrl,
        type: 'permanent'
      });
  
    } catch (error) {
      console.error('Error generating URL:', error);
      res.status(500).json({
        error: 'Failed to generate URL',
        details: error.message
      });
    }
  });

module.exports = router;
