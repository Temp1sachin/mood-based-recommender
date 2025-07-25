const mongoose = require('mongoose');

// Sub-schema for a movie
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: { type: String },
  description: { type: String },
  genres: [String],
  rating: { type: Number, min: 0, max: 5 },
  addedBy: { type: String }, // email of the user who added it
});

// Sub-schema for a playlist
const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coverImage: { type: String },
  movies: [movieSchema],
});

// Sub-schema for a chat message
const chatMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },  // email or name
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

// Main BlendRoom schema
const blendRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  playlist: [playlistSchema],
  chatHistory: [chatMessageSchema],
  createdAt: { type: Date, default: Date.now },
});

const BlendRoom = mongoose.model('BlendRoom', blendRoomSchema);

module.exports = BlendRoom;
