const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middlewares/Verify');
const BlendRoom = require('../models/BlendRoom');
const BlendInvite = require('../models/BlendInvite');

router.post('/join', verifyToken, async (req, res) => {
  const { roomId } = req.body;
  const userId = req.userId;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId required' });
  }

  try {
    let room = await BlendRoom.findOne({ roomId });

    if (!room) {
      // Create new room and assign the current user as the owner
      room = await BlendRoom.create({
        roomId,
        owner: userId,
        participants: [userId],
      });
    } else {
      // Add user to participants if not already present
      if (!room.participants.includes(userId)) {
        room.participants.push(userId);
        await room.save();
      }
    }

    res.json({ room });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ error: 'Server error while joining room' });
  }
});


router.post('/invite', verifyToken, async (req, res) => {
  const { roomId, invitedUserId } = req.body;
  const senderId = req.userId;
  if (!roomId || !invitedUserId) return res.status(400).json({ error: 'roomId and invitedUserId required' });
  await BlendInvite.create({ roomId, senderId, receiverId: invitedUserId });
  res.json({ message: 'Invite sent' });
});

router.get('/pending-invites', verifyToken, async (req, res) => {
  const invites = await BlendInvite.find({ receiverId: req.userId, status: 'pending' })
    .populate('senderId', 'fullName email');
  res.json({ invites });
});

router.post('/respond', verifyToken, async (req, res) => {
  const { inviteId, action } = req.body;
  const invite = await BlendInvite.findById(inviteId);
  if (!invite || invite.receiverId.toString() !== req.userId) return res.status(403).json({ error: 'Invalid invite' });
  invite.status = action;
  await invite.save();
  if (action === 'accepted') {
    await BlendRoom.findOneAndUpdate(
      { roomId: invite.roomId },
      { $addToSet: { participants: req.userId } }
    );
  }
  res.json({ message: `Invite ${action}` });
});


router.post('/leave', verifyToken, async (req, res) => {
  const { roomId } = req.body;
  const userId = req.userId;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId required' });
  }

  try {
    const room = await BlendRoom.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (room.owner && room.owner.toString() === userId) {
      // Delete the room
      await BlendRoom.deleteOne({ roomId });

      // Clean up all invites related to this room
      await BlendInvite.deleteMany({ roomId });

      return res.json({ message: 'ROOM_DELETED' });
    }

    // Remove participant
    room.participants.pull(userId);
    await room.save();

    res.json({ message: 'Left the room' });
  } catch (err) {
    console.error('Error leaving room:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;

