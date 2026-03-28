const mongoose = require("mongoose");

const kuppiRequestSchema = new mongoose.Schema(
  {
    batchRepName: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    faculty: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    letterUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KuppiRequest", kuppiRequestSchema);