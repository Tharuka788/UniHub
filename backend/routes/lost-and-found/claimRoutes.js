const express = require('express');
const router = express.Router();
const {
  createClaim,
  getItemClaims,
  updateClaimStatus
} = require('../../controllers/lost-and-found/claimController');
const { protect } = require('../../middleware/authMiddleware');

router.route('/')
  .post(protect, createClaim);

router.route('/item/:itemId')
  .get(protect, getItemClaims);

router.route('/:id/status')
  .patch(protect, updateClaimStatus);

module.exports = router;
