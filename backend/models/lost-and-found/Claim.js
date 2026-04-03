const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Claim must be linked to an item']
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claim must be linked to a requester']
    },
    proofText: {
      type: String,
      required: [true, 'Please provide a description as proof of ownership'],
      maxlength: [500, 'Proof description cannot exceed 500 characters']
    },
    proofImage: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    finderNotified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Claim', claimSchema);
