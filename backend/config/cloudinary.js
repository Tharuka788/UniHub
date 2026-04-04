const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'unihub_lost_found',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }], // optional
  },
});

module.exports = { cloudinary, storage };
