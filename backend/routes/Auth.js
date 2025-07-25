const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../utils/Multer');
const sendEmail = require('../utils/sendEmail');
const otpStore = require('../utils/otpStore');
const router = express.Router();
const verifyToken = require('../middlewares/Verify');
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

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -resetToken -resetTokenExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update-picture', verifyToken, upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }
        
        const profilePicUrl = req.file.path; // URL from Cloudinary (via multer config)

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { profilePic: profilePicUrl },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        res.json({
            success: true,
            profilePicUrl: updatedUser.profilePic,
            msg: 'Profile picture updated successfully.',
        });

    } catch (err) {
        console.error('Update picture error:', err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/search', verifyToken, async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email query param is required' });
  }

  try {
    const regex = new RegExp(email, 'i'); // case-insensitive match
    const users = await User.find({ email: regex }).select('email fullName profilePic _id');

    // Optionally exclude the requesting user from results:
    const filtered = users.filter(user => user._id.toString() !== req.userId);

    res.status(200).json({ users: filtered });
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ error: 'Server error during user search' });
  }
});
module.exports = router;
