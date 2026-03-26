const express = require("express");
const router = express.Router();
const {
  getAllKuppiRequests,
  createKuppiRequest,
} = require("../../controllers/kuppi/kuppiRequestController");

router.get("/", getAllKuppiRequests);
router.post("/", createKuppiRequest);

module.exports = router;