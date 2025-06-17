const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken=require('../middlewares/Verify')
const upload = require('../utils/Multer');
const sendEmail = require('../utils/sendEmail');
const otpStore = require('../utils/otpStore');
const router = express.Router();
require('dotenv').config();
const SECRET = process.env.JWT_SECRET;




router.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const imageUrl = req.file?.path;

    const otp = Math.floor(100000 + Math.random() * 900000); 

    
    otpStore.set(email, { otp, fullName, hashedPassword, profilePic: imageUrl });

    await sendEmail(email, 'OTP Verification', `<p>Your OTP is <b>${otp}</b></p>`);

    res.status(200).json({ message: 'OTP sent to email' });

  } catch (err) {
    console.error('Signup OTP error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  console.log(email);
  const data = otpStore.get(email);
  if (!data) return res.status(400).json({ message: 'No OTP request found for this email' });

  if (parseInt(otp) !== data.otp) {
    return res.status(401).json({ message: 'Invalid OTP' });
  }

  try {
    const user = new User({
      fullName: data.fullName,
      email,
      password: data.hashedPassword,
      profilePic: data.profilePic,
      playlists: []
    });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    user.accessToken = token;

    await user.save();
    otpStore.delete(email); 

    res.status(201).json({ user, token });

  } catch (err) {
    console.error('OTP verification error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    user.accessToken = token;
    await user.save();

    res.status(200).json({ user, token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset', async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore.set(email, { otp, userId: user._id });

  await sendEmail(email, 'Password Reset OTP', `<p>Your OTP is <b>${otp}</b></p>`);

  res.json({ message: 'OTP sent to email' });
});

router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const data = otpStore.get(email);

  if (!data || parseInt(otp) !== data.otp)
    return res.status(400).json({ message: 'Invalid or expired OTP' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(data.userId, { password: hashedPassword });
  otpStore.delete(email);

  res.json({ message: 'Password reset successfully' });
});


router.post('/addPlaylist', verifyToken, async (req, res) => {
  const { name, genre, rating } = req.body;
  try {
    const user = await User.findById(req.userId);
    user.playlists.push({ name, genre, rating });
    await user.save();
    res.json(user.playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
