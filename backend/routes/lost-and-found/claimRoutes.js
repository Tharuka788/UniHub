const express = require('express');
const router = express.Router();
const {
  createClaim,
  getItemClaims,
  updateClaimStatus,
  verifyHandover,
  getClaimByToken,
  getMyClaims
} = require('../../controllers/lost-and-found/claimController');
const { protect } = require('../../middleware/authMiddleware');

router.route('/')
  .post(protect, createClaim);

router.route('/my-claims')
  .get(protect, getMyClaims);

router.route('/item/:itemId')
  .get(protect, getItemClaims);

router.route('/:id/status')
  .patch(protect, updateClaimStatus);

router.route('/token/:token')
  .get(protect, getClaimByToken);

router.route('/verify/:token')
  .patch(protect, verifyHandover);

router.route('/maintenance/fix-tokens')
  .post(protect, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
    const { fixAllAcceptedClaims } = require('../../controllers/lost-and-found/claimController');
    await fixAllAcceptedClaims(req, res);
  });

module.exports = router;
