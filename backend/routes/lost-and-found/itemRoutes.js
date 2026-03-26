const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../../config/cloudinary');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  toggleContactSharing
} = require('../../controllers/lost-and-found/itemController');
const { protect, loadUser } = require('../../middleware/authMiddleware');

const upload = multer({ storage });

// Configure routes
router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

router.route('/:id')
  .get(loadUser, getItemById)
  .put(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

router.patch('/:id/share-contact', protect, toggleContactSharing);

module.exports = router;
