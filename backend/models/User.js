const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5 }
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accessToken: { type: String },
  profilePic: { type: String }, 
  playlists: [playlistSchema],
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
