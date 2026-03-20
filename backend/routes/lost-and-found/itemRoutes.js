const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../../controllers/lost-and-found/itemController');

// Multer default configuration for local storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5 MB Max
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// Configure routes
router.route('/').get(getItems).post(upload.single('image'), createItem);
router.route('/:id').get(getItemById).put(upload.single('image'), updateItem).delete(deleteItem);

module.exports = router;
