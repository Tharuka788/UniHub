const Item = require('../../models/lost-and-found/Item');
const User = require('../../models/user/User');
const path = require('path');
const fs = require('fs');
const { generateImageEmbedding, cosineSimilarity } = require('../../utils/aiService');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { itemType, search, category, location } = req.query;
    let query = {};

    if (itemType && itemType !== 'All') {
      query.itemType = itemType;
    }
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    if (location && location !== 'All Locations') {
      query.location = location;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await Item.find(query)
      .populate('owner', 'name')
      .sort({ createdAt: -1 });
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
    const item = await Item.findById(req.params.id).populate('owner', 'name email phoneNumber');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Mask contact info if not shared and viewer is not owner
    let responseItem = item.toObject();
    const isOwner = req.user && item.owner && item.owner._id.toString() === req.user.id;

    if (!item.isContactShared && !isOwner) {
      if (responseItem.owner) {
        responseItem.owner.email = 'MASKED';
        responseItem.owner.phoneNumber = 'MASKED';
      }
    }

    res.status(200).json(responseItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { title, category, location, description, itemType } = req.body;
    let imagePath = '';
    let imageEmbedding = null;

    if (req.file) {
      // Store Cloudinary URL
      imagePath = req.file.path;
      
      // Generate image embedding using Cloudinary URL
      imageEmbedding = await generateImageEmbedding(imagePath);
    }

    const item = await Item.create({
      title,
      category,
      location,
      description,
      itemType,
      image: imagePath,
      imageEmbedding,
      owner: req.user ? req.user.id : null // Associate with authenticated user
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

// @desc    Toggle contact sharing
// @route   PATCH /api/items/:id/share-contact
// @access  Private
const toggleContactSharing = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the owner
    if (item.owner && item.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to toggle contact sharing' });
    }

    item.isContactShared = !item.isContactShared;
    await item.save();

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Owner
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check for ownership or admin status
    if (item.owner && item.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to update this item' });
    }

    let updatedData = { ...req.body };

    if (req.file) {
      // If there's a new image, update to the Cloudinary URL
      updatedData.image = req.file.path;
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Owner
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check for ownership or admin status
    if (item.owner && item.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics stats
// @route   GET /api/items/stats
// @access  Private/Admin
const getItemStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Daily Reports (Last 30 Days)
    const dailyReports = await Item.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Category Distribution (Pie Chart)
    const categoryDistribution = await Item.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Overall Totals for Success Rate
    const totalsByStatus = await Item.aggregate([
      {
        $group: {
          _id: "$itemType",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      dailyReports,
      categoryDistribution,
      totalsByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  toggleContactSharing,
  getItemStats
};
