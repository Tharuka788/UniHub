const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      match: [/^[a-zA-Z\s]*$/, 'Title can only contain letters and spaces']
    },
    category: {
      type: String,
      required: [true, 'Please select a category']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [100, 'Description cannot exceed 100 characters']
    },
    image: {
      type: String,
      required: false,
    },
    imageEmbedding: {
      type: [Number],
      required: false,
    },
    location: {
      type: String,
      required: [true, 'Please add a location']
    },
    itemType: {
      type: String,
      enum: ['Lost', 'Found', 'Reclaimed'],
      required: [true, 'Please specify if the item is Lost, Found or Reclaimed']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional for now to avoid breaking existing items
    },
    isContactShared: {
      type: Boolean,
      default: false
    },
    claimedBy: {
      type: String, // ID of the user who successfully connected (mock/dummy ID support)
      default: null
    },
    status: {
      type: String,
      enum: ['Available', 'Pending', 'HandedOver'],
      default: 'Available'
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);
