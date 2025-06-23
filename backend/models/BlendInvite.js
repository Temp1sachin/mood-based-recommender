const mongoose = require('mongoose');
const blendInviteSchema = new mongoose.Schema({
  roomId: String,
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('BlendInvite', blendInviteSchema);