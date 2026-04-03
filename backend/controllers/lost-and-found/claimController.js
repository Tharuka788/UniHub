const Claim = require('../../models/lost-and-found/Claim');
const Item = require('../../models/lost-and-found/Item');
const { sendEmail } = require('../../services/mailerService');

// @desc    Submit a claim for an item
// @route   POST /api/claims
// @access  Private
exports.createClaim = async (req, res) => {
  try {
    const { itemId, proofText, proofImage } = req.body;

    const item = await Item.findById(itemId).populate('owner');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner && item.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim your own item' });
    }

    // Check if user already has a pending claim for this item
    const existingClaim = await Claim.findOne({ item: itemId, requester: req.user._id, status: 'Pending' });
    if (existingClaim) {
      return res.status(400).json({ message: 'You already have a pending claim for this item' });
    }

    const claim = await Claim.create({
      item: itemId,
      requester: req.user._id,
      proofText,
      proofImage
    });

    // Notify Finder (Owner) via Email
    if (item.owner && item.owner.email) {
      try {
        await sendEmail({
          email: item.owner.email,
          subject: `New Claim Request for your item: ${item.title}`,
          message: `Hello ${item.owner.name},\n\nA user has submitted a claim for the item "${item.title}" you posted on UniHub. \n\nPlease log in to review the proof and decide whether to Accept or Reject the claim.\n\nThank you,\nUniHub Support Team`,
          html: `<h3>New Claim Request!</h3><p>Hello ${item.owner.name},</p><p>A user has submitted a claim for the item "<b>${item.title}</b>" you posted on UniHub.</p><p>Please log in to review the proof and decide whether to Accept or Reject the claim.</p><br/><p>Thank you,<br/>UniHub Support Team</p>`
        });
        claim.finderNotified = true;
        await claim.save();
      } catch (mailError) {
        console.error('Email notification failed:', mailError);
        // We still return success for the claim creation even if email fails
      }
    }

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all claims for a specific item (Owner only)
// @route   GET /api/claims/item/:itemId
// @access  Private
exports.getItemClaims = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only owner can see claims
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to see claims for this item' });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('requester', 'name email phoneNumber')
      .sort('-createdAt');

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update claim status (Accept/Reject)
// @route   PATCH /api/claims/:id/status
// @access  Private
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const claim = await Claim.findById(req.params.id).populate('item').populate('requester');
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Only item owner can approve/reject
    if (claim.item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }

    claim.status = status;
    await claim.save();

    // If accepted, update item status and claimedBy
    if (status === 'Accepted') {
      await Item.findByIdAndUpdate(claim.item._id, {
        status: claim.item.itemType === 'Found' ? 'Reclaimed' : 'HandedOver',
        claimedBy: claim.requester._id
      });
      
      // Reject all other pending claims for this item
      await Claim.updateMany(
        { item: claim.item._id, _id: { $ne: claim._id }, status: 'Pending' },
        { status: 'Rejected' }
      );
    }

    // Notify Requester via Email
    try {
      await sendEmail({
        email: claim.requester.email,
        subject: `Update on your claim for: ${claim.item.title}`,
        message: `Hello ${claim.requester.name},\n\nThe owner of the item "${claim.item.title}" has ${status.toLowerCase()} your claim request.\n\nThank you for using UniHub!`,
        html: `<h3>Claim Update!</h3><p>Hello ${claim.requester.name},</p><p>The owner of the item "<b>${claim.item.title}</b>" has <b>${status.toLowerCase()}</b> your claim request.</p><p>Thank you for using UniHub!</p>`
      });
    } catch (mailError) {
      console.error('Email notification failed:', mailError);
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
