const mongoose = require('mongoose');
const blendRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
module.exports = mongoose.model('BlendRoom', blendRoomSchema);
