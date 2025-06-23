const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
// Emotion mapping from FaceAPI output to your dataset
const emotionMap = {
  happy: "joy",
  sad: "sadness",
  angry: "anger",
  fearful: "fear",
  disgusted: "disgust",
  surprised: "surprise",
  neutral: "anticipation"
};


const TMDB_API_KEY = process.env.TMDB_API_KEY

const recommendHandler = async (req, res) => {
  try {
    const { emotion } = req.body;

    if (!emotion) {
      return res.status(400).json({ error: "Emotion is required" });
    }

    const mappedEmotion = emotionMap[emotion.toLowerCase()] ;

    // Read local dataset
    const filePath = path.resolve(__dirname, '../data/movies.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    
    function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// later
const filtered = jsonData.filter(m => m.emotion === mappedEmotion);
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


    res.status(200).json({ movies: results });

  } catch (err) {
    console.error("Error in /recommend:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = recommendHandler;
