const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middlewares/Verify');
const upload = require('../utils/Multer'); 
const router = express.Router();
const fs= require('fs')
const path= require('path')
const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

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

router.delete('/:playlistId/delete', verifyToken, async (req, res) => {
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

router.post('/:playlistId/add-movie', verifyToken, async (req, res) => {
  const { playlistId } = req.params;
  const { title, description, genres } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const playlist = user.playlists.id(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    // Fetch poster from TMDb
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
    let poster = '';
    try {
      const tmdbRes = await axios.get(tmdbUrl);
      const posterPath = tmdbRes.data.results[0]?.poster_path;
      if (posterPath) {
        poster = `https://image.tmdb.org/t/p/w500${posterPath}`;
      }
    } catch (e) {
      console.warn('TMDb failed:', e.message);
    }

    // Push movie to playlist
    playlist.movies.push({ title, description, genres, poster });
    await user.save();

    res.status(200).json({ playlist });
  } catch (err) {
    console.error('Error adding movie:', err);
    res.status(500).json({ error: 'Server error while adding movie' });
  }
});

router.get('/:playlistId/movies', verifyToken, async (req, res) => {
  const { playlistId } = req.params;

  try {
    
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    
    const playlist = user.playlists.id(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    
    res.status(200).json({ movies: playlist.movies });

  } catch (err) {
    console.error('Error fetching playlist movies:', err);
    res.status(500).json({ error: 'Server error while fetching movies' });
  }
});

// GET /playlist/:id
router.get('/:playlistId', verifyToken, async (req, res) => {
  const { playlistId } = req.params;

  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const playlist = user.playlists.id(playlistId);

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    
    res.status(200).json({ playlist: playlist.toObject() });

  } catch (err) {
    console.error('Error fetching playlist:', err);
    res.status(500).json({ error: 'Server error while fetching playlist' });
  }
});

router.delete('/:playlistId/movie/:movieId/delete', verifyToken, async (req, res) => {
  const { playlistId, movieId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const playlist = user.playlists.id(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    const initialLength = playlist.movies.length;
    playlist.movies = playlist.movies.filter(movie => movie._id.toString() !== movieId);

    if (playlist.movies.length === initialLength) {
      return res.status(404).json({ error: 'Movie not found in playlist' });
    }

    await user.save();
    res.status(200).json({ message: 'Movie removed successfully', playlist });

  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ error: 'Server error while deleting movie' });
  }
});

router.get('/movie/data', verifyToken, (req, res) => {
  const filePath = path.join(__dirname, '../data/movies.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read movies.json:', err);
      return res.status(500).json({ error: 'Failed to load movies' });
    }

    try {
      const movies = JSON.parse(data);
      res.json(movies);
    } catch (parseErr) {
      console.error('Failed to parse movies.json:', parseErr);
      res.status(500).json({ error: 'Failed to parse movies' });
    }
  });
});



module.exports = router;
