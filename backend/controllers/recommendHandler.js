const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const recommendHandler = async (req, res) => {
  try {
    const { emotion } = req.body;
    const isHighIntensity = req.isHighIntensity || false;
    if (!emotion) {
      return res.status(400).json({ error: "Emotion is required" });
    }

    const filePath = path.resolve(__dirname, '../data/movies.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log("Incoming Emotion:", emotion);
    const filtered = jsonData.filter(
      (m) => m.emotion?.trim().toLowerCase() === emotion.trim().toLowerCase()
    );

    if (filtered.length === 0) {
      console.warn("No movies found for emotion:", emotion);
    }

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    const randomMovies = shuffle(filtered).slice(0, 6);

    const results = await Promise.all(
      randomMovies.map(async (movie) => {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.movie_name)}`;
        try {
          const tmdbRes = await axios.get(searchUrl);
          const posterPath = tmdbRes.data.results[0]?.poster_path;
          const posterUrl = posterPath
            ? `https://image.tmdb.org/t/p/w500${posterPath}`
            : 'https://via.placeholder.com/300x450?text=No+Image';

          return {
            title: movie.movie_name,
            genres: movie.genres.split(',').map(g => g.trim()),
            description: movie.Description,
            poster: posterUrl,
          };
        } catch (err) {
          return {
            title: movie.movie_name,
            genres: movie.genres.split(',').map(g => g.trim()),
            description: movie.Description,
            poster: 'https://via.placeholder.com/300x450?text=No+Image',
          };
        }
      })
    );

    res.status(200).json({
      mood: emotion, // Send back the determined mood
      isHighIntensity: isHighIntensity, // Send the flag
      movies: results,
    });
  } catch (err) {
    console.error("Error in /recommend:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = recommendHandler;
