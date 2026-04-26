const Claim = require('../../models/lost-and-found/Claim');
const Item = require('../../models/lost-and-found/Item');
const { sendEmail } = require('../../services/mailerService');
const User = require('../../models/user/User');
const Notification = require('../../models/chat/Notification');
const crypto = require('crypto');
const QRCode = require('qrcode');

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

    const userId = req.user._id || req.user.id;
    const reqUserIdStr = userId ? userId.toString() : '';

    if (item.owner) {
      const ownerId = item.owner._id || item.owner.id || item.owner;
      if (ownerId.toString() === reqUserIdStr) {
        return res.status(400).json({ message: 'You cannot claim your own item' });
      }
    }

    // Check if user already has a pending claim for this item
    const existingClaim = await Claim.findOne({ item: itemId, requester: userId, status: 'Pending' });
    if (existingClaim) {
      return res.status(400).json({ message: 'You already have a pending claim for this item' });
    }

    const claim = await Claim.create({
      item: itemId,
      requester: userId,
      proofText,
      proofImage
    });

    // Notify Finder (Owner) via Email
    if (item.owner && item.owner.email) {
      try {
        await sendEmail({
          email: item.owner.email,
          subject: `New Claim Request for your item: ${item.title}`,
          message: `Hello ${item.owner.name},\n\nA user has submitted a claim for the item "${item.title}" you posted on UniHub.\n\nPlease log in to review the proof and decide whether to Accept or Reject the claim.\n\nThank you,\nUniHub Support Team`,
          html: `<h3>New Claim Request!</h3><p>Hello ${item.owner.name},</p><p>A user has submitted a claim for the item "<b>${item.title}</b>" you posted on UniHub.</p><p>Please log in to review the proof and decide whether to Accept or Reject the claim.</p><br/><p>Thank you,<br/>UniHub Support Team</p>`
        });
        claim.finderNotified = true;
        await claim.save();
      } catch (mailError) {
        console.error('Email notification failed:', mailError);
      }
    }

    // Notify all system administrators via socket + DB notification
    try {
      const admins = await User.find({ isAdmin: true });
      for (const admin of admins) {
        const adminNotif = await Notification.create({
          recipientId: admin._id ? admin._id.toString() : admin.id.toString(),
          senderId: reqUserIdStr,
          messagePreview: `📦 New claim submitted for item: "${item.title}"`,
          itemId: item._id ? item._id.toString() : item.id.toString(),
          type: 'claim'
        });

        if (req.io) {
          req.io.to(`user-${admin._id}`).emit('new_notification', adminNotif);
        }
      }
    } catch (notifError) {
      console.error('Admin notification failed:', notifError);
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

    const userId = req.user._id || req.user.id;
    const ownerId = item.owner ? (item.owner._id || item.owner.id || item.owner) : null;
    
    // Only owner or Admin can see claims
    if (!req.user.isAdmin && (!ownerId || ownerId.toString() !== userId.toString())) {
      return res.status(403).json({ message: 'Not authorized to see claims for this item' });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('requester', 'name email phoneNumber')
      .populate('item', 'title image status itemType')
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

    if (!claim.item) {
      return res.status(404).json({ message: 'Linked item not found' });
    }

    // Requester check - if missing, we just skip notifications but allow the status update
    const requesterExists = !!claim.requester;

    const userId = req.user._id || req.user.id;
    const ownerId = claim.item.owner ? (claim.item.owner._id || claim.item.owner.id || claim.item.owner) : null;

    // Only item owner or Admin can approve/reject
    if (!req.user.isAdmin && (!ownerId || ownerId.toString() !== userId.toString())) {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }

    claim.status = status;

    // If accepted, generate verification QR and update item
    if (status === 'Accepted') {
      const token = crypto.randomBytes(16).toString('hex');
      let qrDataUrl = '';
      
      try {
        // Try local generation first
        qrDataUrl = await QRCode.toDataURL(`http://localhost:5173/verify-claim/${token}`);
      } catch (qrErr) {
        console.error('Local QR Generation failed, using Google Charts fallback:', qrErr);
        // Fallback to Google Charts API URL
        qrDataUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=http://localhost:5173/verify-claim/${token}`;
      }
      
      claim.verificationToken = token;
      claim.qrCode = qrDataUrl;

      await Item.findByIdAndUpdate(claim.item._id, {
        itemType: 'Reclaimed',
        status: 'HandedOver',
        claimedBy: requesterExists ? (claim.requester._id || claim.requester) : 'Deleted User'
      });
      
      // Reject all other pending claims for this item
      await Claim.updateMany(
        { item: claim.item._id, _id: { $ne: claim._id }, status: 'Pending' },
        { status: 'Rejected' }
      );

      // Notify Requester via Email with QR
      if (requesterExists && claim.requester.email) {
        try {
          const qrExternalUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=http://localhost:5173/verify-claim/${token}`;
          
          const mailOptions = {
            email: claim.requester.email,
            subject: `🎉 Claim Approved: ${claim.item.title}`,
            message: `Congratulations! Your claim for "${claim.item.title}" has been approved. Token: ${token}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 15px; text-align: center;">
                <h2 style="color: #28a745; margin-bottom: 20px;">🎉 Claim Approved!</h2>
                <p style="color: #444; font-size: 16px;">Hello <b>${claim.requester.name}</b>,</p>
                <p style="color: #555;">Your claim for the item "<b>${claim.item.title}</b>" has been approved.</p>
                
                <div style="margin: 25px 0; padding: 15px; background: #f9f9f9; border-radius: 10px;">
                  <p style="font-weight: bold; color: #333;">Your Handover QR Code:</p>
                  <img src="${qrExternalUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 5px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
                  <p style="font-size: 14px; color: #888; margin-top: 10px;">Token: ${token}</p>
                </div>

                <p style="color: #666; font-size: 14px;">Please present this QR code to the Admin/Guard to collect your item.</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
                <p style="color: #999; font-size: 12px;">UniHub Campus Security System</p>
              </div>
            `
          };

          // Still attach the base64 one as backup if available
          if (qrDataUrl) {
            mailOptions.attachments = [{
              filename: 'verification-qr.png',
              content: Buffer.from(qrDataUrl.split('base64,')[1], 'base64'),
              cid: 'qrcode'
            }];
          }

          await sendEmail(mailOptions);
        } catch (mailError) {
          console.error('Email notification failed:', mailError);
        }
      }
    } else {
      // If rejected, just notify
      if (requesterExists && claim.requester.email) {
        try {
          await sendEmail({
            email: claim.requester.email,
            subject: `Update on your claim for: ${claim.item.title}`,
            message: `Hello ${claim.requester.name},\n\nYour claim for "${claim.item.title}" has been rejected.`,
            html: `<h3>Claim Rejected</h3><p>Hello ${claim.requester.name},</p><p>Your claim for "<b>${claim.item.title}</b>" was not accepted by the admin.</p>`
          });
        } catch (mailError) {
          console.error('Email notification failed:', mailError);
        }
      }
    }

    // Save claim changes
    await claim.save();

    // Notify Requester via real-time socket notification
    if (requesterExists) {
      try {
        const requesterIdStr = (claim.requester._id || claim.requester.id || claim.requester).toString();
        const emoji = status === 'Accepted' ? '✅' : '❌';
        const userNotif = await Notification.create({
          recipientId: requesterIdStr,
          senderId: requesterIdStr,
          messagePreview: `${emoji} Your claim for "${claim.item.title}" was ${status.toLowerCase()}. Check 'My Claims' for your QR!`,
          itemId: claim.item._id.toString(),
          type: 'claim_update',
        });

        if (req.io) {
          req.io.to(`user-${requesterIdStr}`).emit('new_notification', userNotif);
        }
      } catch (notifError) {
        console.error('User socket notification failed:', notifError);
      }
    }

    res.json(claim);
  } catch (error) {
    console.error('Update Claim Status Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify handover via QR token
// @route   PATCH /api/claims/verify/:token
// @access  Private (Admin only)
exports.verifyHandover = async (req, res) => {
  try {
    const { token } = req.params;
    
    const claim = await Claim.findOne({ verificationToken: token }).populate('item').populate('requester');
    if (!claim) {
      return res.status(404).json({ message: 'Invalid verification token' });
    }

    if (claim.isVerified) {
      return res.status(400).json({ message: 'This item has already been handed over' });
    }

    claim.isVerified = true;
    await claim.save();

    // Update item status finally
    await Item.findByIdAndUpdate(claim.item._id, { status: 'HandedOver' });

    res.json({ 
      success: true, 
      message: 'Item verified and handed over successfully!',
      item: claim.item.title,
      owner: claim.requester.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's claims
// @route   GET /api/claims/my-claims
// @access  Private
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ requester: req.user._id })
      .populate('item', 'title image status itemType location')
      .sort('-createdAt');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fix existing accepted claims (Maintenance)
exports.fixAllAcceptedClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ status: 'Accepted', verificationToken: { $exists: false } });
    let count = 0;
    for (const claim of claims) {
      const token = crypto.randomBytes(16).toString('hex');
      let qrDataUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=http://localhost:5173/verify-claim/${token}`;
      claim.verificationToken = token;
      claim.qrCode = qrDataUrl;
      await claim.save();
      count++;
    }
    res.json({ message: `Successfully fixed ${count} claims.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
