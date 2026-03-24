const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Relative path to backend root
  },
  filename: function (req, file, cb) {
    // timestamp-based filenames
    cb(null, 'payment-' + Date.now() + path.extname(file.originalname));
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpg, jpeg, png format allowed)!'));
  }
};

// Initialize upload object
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max size
  fileFilter: fileFilter
});

module.exports = upload;
