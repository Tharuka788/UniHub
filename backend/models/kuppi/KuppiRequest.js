const mongoose = require("mongoose");

const kuppiRequestSchema = new mongoose.Schema(
  {},
  { timestamps: true }
);

module.exports = mongoose.model("KuppiRequest", kuppiRequestSchema);