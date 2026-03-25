const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../../config/cloudinary');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../../controllers/lost-and-found/itemController');

const upload = multer({ storage });

// Configure routes
router.route('/').get(getItems).post(upload.single('image'), createItem);
router.route('/:id').get(getItemById).put(upload.single('image'), updateItem).delete(deleteItem);

module.exports = router;
