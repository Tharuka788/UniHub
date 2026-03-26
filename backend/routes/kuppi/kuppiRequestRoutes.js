const express = require("express");
const router = express.Router();

const multer = require("multer");
const { storage } = require("../../config/cloudinary");

const upload = multer({ storage });

const {
  createKuppiRequest,
  getAllKuppiRequests,
} = require("../../controllers/kuppi/kuppiRequestController");

router.get("/", getAllKuppiRequests);
router.post("/", upload.single("letter"), createKuppiRequest);

module.exports = router;