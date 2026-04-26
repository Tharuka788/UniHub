const express = require("express");
const router = express.Router();
const multer = require("multer");

const { storage } = require("../../config/cloudinary");
const upload = multer({ storage });

const {
  createKuppiRequest,
  getAllKuppiRequests,
  approveKuppiRequest,
  rejectKuppiRequest,
} = require("../../controllers/kuppi/kuppiRequestController");

router.get("/", getAllKuppiRequests);
router.post("/", upload.single("letter"), createKuppiRequest);
router.put("/approve/:id", approveKuppiRequest);
router.put("/reject/:id", rejectKuppiRequest);

module.exports = router;