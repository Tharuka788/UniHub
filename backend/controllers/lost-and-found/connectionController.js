const Item = require('../../models/lost-and-found/Item');
const Notification = require('../../models/chat/Notification');

// @desc    Request a handshake (connection) with item owner
// @route   POST /api/items/:id/request-handshake
// @access  Private
const requestHandshake = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const requesterId = req.user ? (req.user._id || req.user.id) : 'mockUserId123';
    const ownerId = item.owner ? (item.owner._id || item.owner).toString() : null;

    if (!ownerId) {
      return res.status(400).json({ message: 'Item owner not found' });
    }

    if (requesterId === ownerId) {
      return res.status(400).json({ message: 'Owners cannot request handshakes with themselves' });
    }

    // Create handshake notification for owner
    const notification = await Notification.create({
      recipientId: ownerId,
      senderId: requesterId,
      messagePreview: `Requested identity connection for "${item.title}"`,
      itemId: item._id,
      type: 'handshake'
    });

    res.status(201).json({ message: 'Handshake request sent', notification });
  } catch (error) {
    console.error('Error requesting handshake:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Accept a handshake from a requester
// @route   POST /api/items/:id/accept-handshake/:requesterId
// @access  Private
const acceptHandshake = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const ownerId = req.user ? (req.user._id || req.user.id).toString() : 'mockUserId123';
    const currentOwnerId = item.owner ? (item.owner._id || item.owner).toString() : null;

    if (ownerId !== currentOwnerId) {
      return res.status(403).json({ message: 'Only the item owner can accept handshakes' });
    }

    const { requesterId } = req.params;

    // Update item status and connect the user
    item.claimedBy = requesterId;
    item.status = 'Pending'; // Pending Actual Exchange
    await item.save();

    // Create notification for requester
    await Notification.create({
      recipientId: requesterId,
      senderId: ownerId,
      messagePreview: `Accepted your connection request for "${item.title}"! Identity revealed.`,
      itemId: item._id,
      type: 'handshake'
    });

    res.status(200).json({ message: 'Handshake accepted', item });
  } catch (error) {
    console.error('Error accepting handshake:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  requestHandshake,
  acceptHandshake
};
