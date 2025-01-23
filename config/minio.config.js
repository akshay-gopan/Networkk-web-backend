const Minio = require('minio');
require('dotenv').config();

var minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: process.env.MINIO_PORT,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});


// Buckets to be created
const buckets = ['profile-pictures', 'work-images', 'documents'];

// Function to create buckets
const createBuckets = async () => {
  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1'); // Replace with your preferred region
        console.log(`Bucket '${bucket}' created successfully.`);
      } else {
        console.log(`Bucket '${bucket}' already exists.`);
      }
    } catch (error) {
      console.error(`Error creating bucket '${bucket}':`, error.message);
    }
  }
};

// Initialize buckets on server startup
createBuckets().then(() => {
  console.log('Bucket setup complete.');
}).catch((err) => {
  console.error('Error during bucket setup:', err.message);
});

module.exports = minioClient;