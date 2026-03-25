const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    image: {
      type: String,
      required: false,
    },
    imageEmbedding: {
      type: [Number],
      required: false,
    },
    itemType: {
      type: String,
      enum: ['Lost', 'Found'],
      required: [true, 'Please specify if the item is Lost or Found']
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);
