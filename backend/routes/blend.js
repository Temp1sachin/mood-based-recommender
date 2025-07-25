
const express = require('express'); // ⬅️ NEW for Express routing
const { v4: uuidv4 } = require('uuid'); // ⬅️ NEW for generating unique room IDs
const BlendRoom = require('../models/BlendRoom'); // ⬅️ NEW import for BlendRoom model
const verifyToken = require('../middlewares/Verify');
const User = require('../models/User');

const router = express.Router();

// routes/blend.js

// In backend/routes/blend.js
module.exports = (io) => {
router.post('/create-room',verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const roomId = uuidv4();

    console.log(`Attempting to create room with ID: ${roomId} for user: ${userId}`);

    const newRoom = new BlendRoom({
      roomId,
      createdBy: userId,
      participants: [userId],
    });

    // This now properly waits for the save operation to finish.
    const savedRoom = await newRoom.save();

    // This code will ONLY run if the .save() was successful.
    console.log(`✅ Room successfully saved to MongoDB. ID: ${savedRoom.roomId}`);
    res.status(201).json({ roomId: savedRoom.roomId });

  } catch (error) {
    // If .save() fails for any reason, this block will run.
    console.error('❌ Error saving room to MongoDB:', error);

    // Send a proper error response to the frontend.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create room', details: error.message });
    }
  }
});



// Join a blend room
router.post('/join', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.userId;

    let room = await BlendRoom.findOne({ roomId });

    console.log('JOIN DEBUG - roomId:', roomId, 'userId:', userId);

    if (!room) {
      console.log('JOIN DEBUG - Room not found');
      return res.status(404).json({ error: 'Room not found' });
    }

    // Convert ObjectId to string to safely compare
    const participantIds = room.participants.map(id => id.toString());

    console.log('JOIN DEBUG - Participants before:', participantIds);

    // Add user if not already a participant
    if (!participantIds.includes(userId)) {
      room.participants.push(userId);
      await room.save();
      console.log('JOIN DEBUG - Added user to participants');
    }

    // ✅ Populate participants directly on the existing room object
    await room.populate('participants', 'fullName email profilePic');

    console.log('JOIN DEBUG - Participants after:', room.participants);

    res.json({ room });

  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});


// Leave a blend room
router.post('/leave', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.userId;
    let room = await BlendRoom.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    // Remove user from participants
    room.participants = room.participants.filter(
      (id) => id.toString() !== userId
    );
    if (room.participants.length === 0) {
      await BlendRoom.deleteOne({ roomId });
      return res.json({ message: 'Room deleted (no participants left)' });
    } else {
      await room.save();
      return res.json({ message: 'Left room', participants: room.participants });
    }
  } catch (err) {
    console.error('Leave room error:', err);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

// Create Playlist
// Make sure you have this at the top of your blend.js file
const upload = require('../utils/Multer'); // Assuming your Multer config is here


// ... other routes

// Create Playlist (Now handles file uploads)
 router.post("/playlist/create", upload.single('coverImage'), async (req, res) => {
    const { roomId, name } = req.body;
    const coverImage = req.file?.path;

    if (!roomId || !name || !coverImage) {
      return res.status(400).json({ msg: "Room ID, name, and cover image are required." });
    }

    try {
      const room = await BlendRoom.findOne({ roomId });
      if (!room) return res.status(404).json({ msg: "Room not found" });
      
      room.playlist.push({ name, coverImage, movies: [] });
      await room.save();

      // ✅ BROADCAST THE UPDATE to everyone in the room
      io.to(roomId).emit('room-playlists-updated', room.playlist);
      
      // Still send the normal HTTP response to the user who uploaded
      res.status(201).json({ msg: "Playlist created", playlist: room.playlist });
    
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// ... rest of your routes
// routes/blend.js

// ... (after other routes)

// Add a message to the chat history
router.post('/chat/message', verifyToken, async (req, res) => {
  try {
    const { roomId, message } = req.body;
    const userId = req.userId; // Assuming verifyToken gives us the user's ID

    // Find the user to get their email or name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const room = await BlendRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const chatMessage = {
      sender: user.email, // Or user.fullName, based on your preference
      message,
    };

    room.chatHistory.push(chatMessage);
    await room.save();

    res.status(201).json({ message: 'Message saved', chatHistory: room.chatHistory });

  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Update Playlist
router.put("/playlist/update", async (req, res) => {
  const { roomId, playlistId, name, coverImage } = req.body;
  try {
    const room = await BlendRoom.findOne({ roomId });
    if (!room) return res.status(404).json({ msg: "Room not found" });

    const playlist = room.playlist.id(playlistId);
    if (!playlist) return res.status(404).json({ msg: "Playlist not found" });

    playlist.name = name || playlist.name;
    playlist.coverImage = coverImage || playlist.coverImage;
    await room.save();

    res.json({ msg: "Playlist updated", playlists: room.playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Playlist
// In backend/routes/blend.js

router.delete("/playlist/delete", async (req, res) => {
  const { roomId, playlistId } = req.body;
  try {
    const room = await BlendRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    // Use the .pull() method on the correct field name ('playlist')
    // This finds and removes the subdocument with the matching _id in one step.
    room.playlist.pull(playlistId);

    await room.save();

    // Return the updated 'playlist' array
    res.json({ msg: "Playlist deleted", playlist: room.playlist });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Movie to Playlist
// Add these to the top of your blend.js file
const axios = require('axios');
 // Make sure the path is correct
const TMDB_API_KEY = process.env.TMDB_API_KEY; // Ensure you have this in your .env file

// ... other routes

// Add Movie to Playlist (with TMDB Poster Fetching)
router.post("/playlist/add-movie", verifyToken, async (req, res) => {
  // The movie object comes from the request body
  const { roomId, playlistId, movie } = req.body;

  if (!movie || !movie.title) {
      return res.status(400).json({ msg: "Movie data with a title is required." });
  }

  try {
    const room = await BlendRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    // Correctly find the playlist within the 'playlist' array
    const playlist = room.playlist.id(playlistId);
    if (!playlist) {
      return res.status(404).json({ msg: "Playlist not found" });
    }

    // --- TMDb Poster Fetching Logic ---
    let posterUrl = movie.poster || ''; // Use default poster from request if available
    try {
      const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}`;
      const tmdbResponse = await axios.get(tmdbSearchUrl);
      const posterPath = tmdbResponse.data.results[0]?.poster_path;
      
      if (posterPath) {
        posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
      }
    } catch (apiError) {
      // If TMDb fails, we can still proceed without a poster
      console.warn(`TMDb API failed for title "${movie.title}":`, apiError.message);
    }
    // --- End of TMDb Logic ---

    // Create the final movie object with the fetched poster
    const movieToAdd = {
        title: movie.title,
        poster: posterUrl,
        description: movie.description,
        genres: movie.genres,
        rating: movie.rating || 0,
        addedBy: req.userId // Optionally track who added the movie
    };

    playlist.movies.push(movieToAdd);
    await room.save();

    // Respond with the updated playlist
    res.json({ msg: "Movie added successfully", playlist });

  } catch (err) {
    console.error('Error adding movie to playlist:', err);
    res.status(500).json({ error: "Server error while adding movie." });
  }
});

// ... rest of your routes

// Delete Movie from Playlist
// routes/blend.js

// ... other routes

// Delete Movie from Playlist
// Delete Movie from Playlist
router.delete("/playlist/delete-movie", async (req, res) => {
  const { roomId, playlistId, movieId } = req.body;
  try {
    const room = await BlendRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    const playlist = room.playlist.id(playlistId);
    if (!playlist) {
      return res.status(404).json({ msg: "Playlist not found" });
    }

    // Use the .pull() method to find and remove the movie in one step.
    // This is the idiomatic Mongoose way to do this.
    playlist.movies.pull(movieId);

    await room.save();

    res.json({ msg: "Movie deleted", playlist });
  } catch (err) {
    console.error("Error during movie deletion:", err);
    res.status(500).json({ error: err.message });
  }
});

// ... rest of your routes
// GET /blend/:roomId - fetch room and its playlists
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await BlendRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ room });
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// In routes/blend.js, inside the module.exports function

// GET recommendations from participants' personal playlists
// In routes/blend.js

// This should ideally be initialized once in your main index.js and passed down
// but for simplicity in this example, we'll initialize it here.
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


// ROUTE 1: Get recommendations from participants' personal playlists
router.get('/:roomId/internal-recommendations', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await BlendRoom.findOne({ roomId }).populate('playlist.movies');
    if (!room) return res.status(404).json({ message: 'Blend Room not found.' });

    // Fetch participants and their playlists. Favorites are included by default.
    const participants = await User.find({ _id: { $in: room.participants } }).populate('playlists.movies');
    
    // 👇 THE FIX: Combine movies from both playlists AND favorites
    const allFriendMovies = participants.flatMap(user => {
      const playlistMovies = user.playlists.flatMap(pl => pl.movies);
      const favoriteMovies = user.favorites || []; // Get favorite movies, default to empty array
      return [...playlistMovies, ...favoriteMovies]; // Combine them
    });

    // The rest of your logic for finding unique movies remains the same
    const uniqueMoviesMap = new Map();
    allFriendMovies.forEach(movie => {
      if (movie && movie.title && !uniqueMoviesMap.has(movie.title)) {
        uniqueMoviesMap.set(movie.title, movie);
      }
    });

    // The rest of your logic for filtering out movies already in the blend remains the same
    const blendPlaylistMovieTitles = new Set(room.playlist.flatMap(pl => pl.movies.map(m => m.title)));
    const finalRecs = Array.from(uniqueMoviesMap.values()).filter(movie => !blendPlaylistMovieTitles.has(movie.title));

    res.json({ recommendations: finalRecs });
  } catch (error) {
    console.error("Error fetching internal recommendations:", error);
    res.status(500).json({ error: 'Failed to fetch recommendations.' });
  }
});


// ROUTE 2: Get new recommendations from Gemini AI
router.post('/:roomId/ai-recommendations', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await BlendRoom.findOne({ roomId });
    if (!room) return res.status(404).json({ message: 'Blend Room not found.' });

    const participants = await User.find({ _id: { $in: room.participants } }).populate('playlists.movies');
    const blendMovies = room.playlist.flatMap(pl => pl.movies.map(m => m.title));
    const friendMovies = participants.flatMap(user => user.playlists.flatMap(pl => pl.movies.map(m => m.title)));
    const allKnownTitles = [...new Set([...blendMovies, ...friendMovies])];

    if (allKnownTitles.length < 3) { // Require at least 3 movies for a good recommendation
      return res.status(400).json({ message: "Add more movies to your playlists to get AI recommendations." });
    }

    const prompt = `Based on this list of movies: ${allKnownTitles.join(', ')}. Recommend 5 other movies this group might like. Provide ONLY a JSON array of movie titles. Example: ["Inception", "The Matrix", "Shutter Island"]`;
    
    const result = await geminiModel.generateContent(prompt);
    const textResponse = await result.response.text();
    
    const jsonString = textResponse.match(/\[.*\]/s);
    if (!jsonString) throw new Error("Failed to parse Gemini's response.");
    
    const recommendations = JSON.parse(jsonString[0]);

    res.json({ recommendations });
  } catch (error) {
    console.error("Error fetching AI recommendations:", error);
    res.status(500).json({ error: 'Failed to fetch AI recommendations.' });
  }
});

return router;

};
 
