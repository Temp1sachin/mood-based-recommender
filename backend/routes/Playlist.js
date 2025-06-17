const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middlewares/Verify');
const upload = require('../utils/Multer'); 
const router = express.Router();


router.post('/create', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;
    const coverImage = req.file?.path || ''; 

    if (!name) return res.status(400).json({ message: "Playlist name is required" });

    const user = await User.findById(userId);
    user.playlists.push({ name, coverImage });
    await user.save();

    res.status(201).json({
      message: "Playlist created successfully",
      playlists: user.playlists,
    });
  } catch (err) {
    console.error('Error creating playlist:', err);
    res.status(500).json({ error: "Could not create playlist" });
  }
});

router.get('/all', verifyToken, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ playlists: user.playlists });
});

router.delete('/:playlistId', verifyToken, async (req, res) => {
  const { playlistId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.playlists = user.playlists.filter(
      (playlist) => playlist._id.toString() !== playlistId
    );

    await user.save();

    res.status(200).json({ message: 'Playlist deleted', playlists: user.playlists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

module.exports = router;
