const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/Verify'); // Assuming you have auth middleware
const User = require('../models/User');

// ====================================================================
// GET /api/favorites - Fetch all favorite movies for the logged-in user
// ====================================================================
router.get('/', verifyToken, async (req, res) => {
  try {
    // Find the user by the ID from the auth token and select only the favorites field
    const user = await User.findById(req.userId).select('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ====================================================================
// POST /api/favorites/add - Add a movie to the user's favorites
// ====================================================================
router.post('/add', verifyToken, async (req, res) => {
  // Destructure the movie details from the request body
  const { title, poster, description, genres } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Movie title is required' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the movie (by title) is already in the user's favorites
    const isAlreadyFavorite = user.favorites.some(fav => fav.title === title);
    if (isAlreadyFavorite) {
      return res.status(400).json({ message: 'This movie is already in your favorites' });
    }

    // Create the new movie object and add it to the array
    const newFavorite = { title, poster, description, genres };
    user.favorites.push(newFavorite);
    
    // Save the updated user document
    await user.save();

    // Return a success message and the updated list of favorites
    res.status(201).json({ message: 'Movie added to favorites', favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// DELETE /api/favorites/remove/:movieId - Remove a movie from favorites
// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
router.delete('/remove/:movieId', verifyToken, async (req, res) => {
  const { movieId } = req.params; // Get the movie's _id from the URL parameter

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use the $pull operator to remove the movie from the favorites array by its _id
    user.favorites.pull({ _id: movieId });
    
    // Save the updated user document
    await user.save();

    // Return a success message and the updated list of favorites
    res.json({ message: 'Movie removed from favorites', favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;