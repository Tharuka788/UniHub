const Item = require('../../models/lost-and-found/Item');
const path = require('path');
const fs = require('fs');
const { generateImageEmbedding, cosineSimilarity } = require('../../utils/aiService');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { itemType } = req.query; // e.g., ?itemType=Lost
    const query = itemType ? { itemType } : {};
    
    const items = await Item.find(query).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Public
const createItem = async (req, res) => {
  try {
    const { title, category, description, itemType } = req.body;
    let imagePath = '';
    let imageEmbedding = null;

    if (req.file) {
      // Store static path to the image
      imagePath = `/uploads/${req.file.filename}`;
      
      // Generate image embedding
      const fullPath = path.join(__dirname, '../..', imagePath);
      imageEmbedding = await generateImageEmbedding(fullPath);
    }

    const item = await Item.create({
      title,
      category,
      description,
      itemType,
      image: imagePath,
      imageEmbedding
    });

    let matches = [];
    // If it's a Lost item with an embedding, find potential Found matches
    if (itemType === 'Lost' && imageEmbedding) {
      const candidates = await Item.find({ itemType: 'Found', imageEmbedding: { $exists: true, $ne: [] } });
      
      const scoredCandidates = candidates.map(candidate => {
        const score = cosineSimilarity(imageEmbedding, candidate.imageEmbedding);
        return { item: candidate, score };
      });

      matches = scoredCandidates
        .filter(c => c.score > 0.75) // Threshold for visual similarity
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) // Get top 3
        .map(c => ({...c.item.toObject(), similarityScore: c.score}));
    }

    res.status(201).json({ item, matches });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Public
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let updatedData = { ...req.body };

    if (req.file) {
      // If there's a new image, update the path and optionally delete the old image
      updatedData.image = `/uploads/${req.file.filename}`;
      if (item.image) {
        const oldImagePath = path.join(__dirname, '../..', item.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Public
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete associated image file
    if (item.image) {
      const imagePath = path.join(__dirname, '../..', item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await item.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
