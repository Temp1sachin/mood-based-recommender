'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Imports for the new UI
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, LoaderCircle } from 'lucide-react';

// A simple, themed loading spinner
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center p-12 text-center">
    <LoaderCircle className="w-8 h-8 text-purple-400 animate-spin mb-4" />
    <p className="text-gray-400">Loading movies...</p>
  </div>
);

const MovieSearch = ({ playlist, onAddMovie, onBack, token }) => {
  // --- YOUR ORIGINAL STATE AND LOGIC (100% PRESERVED) ---
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get('http://localhost:8000/playlist/movie/data', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setAllMovies(res.data);
        setFilteredMovies(res.data); // Initially show all movies
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [token]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = allMovies.filter(movie =>
      movie.movie_name.toLowerCase().includes(lowercasedQuery) ||
      movie.genres.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredMovies(filtered);
  }, [searchQuery, allMovies]);
  // --- END OF YOUR ORIGINAL LOGIC ---


  // --- NEW RENDER LOGIC WITH THEMED UI ---
  return (
    <div className="w-full text-gray-200 p-2">
      <Button onClick={onBack} variant="outline" className="mb-6 bg-transparent border-gray-700 hover:bg-gray-800 hover:text-gray-100">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Playlist
      </Button>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">
          Add Movies to <span className="text-pink-400">{playlist.name}</span>
        </h1>
        <p className="text-md text-gray-500 mt-1">Search our library to add to your blend.</p>
      </div>
      
      {/* --- Styled Search Input --- */}
      <div className="mb-8 relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
        <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title or genre..."
            className="w-full h-14 pl-12 pr-4 text-lg bg-gray-800 border-2 border-purple-800/60 rounded-full focus:ring-2 focus:ring-pink-500/80 focus:border-pink-500 transition-all placeholder:text-gray-500"
        />
      </div>

      {/* --- Styled Movies List --- */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <AnimatePresence>
          <motion.div 
            className="space-y-3"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            initial="hidden"
            animate="visible"
          >
            {filteredMovies.map((movie, index) => (
              <motion.div
                key={index}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                layout
                className="bg-gray-900/50 p-4 rounded-lg border border-gray-800/50 flex items-center justify-between gap-4"
              >
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-lg font-semibold text-gray-100 truncate">{movie.movie_name}</h3>
                  <p className="text-sm text-purple-400 truncate">{movie.genres}</p>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{movie.Description}</p>
                </div>
                <Button
                  size="icon"
                  onClick={() => onAddMovie(movie)}
                  className="bg-purple-600/20 text-purple-300 border border-purple-600/50 hover:bg-purple-600/40 hover:text-purple-200 transition-all rounded-full h-10 w-10 flex-shrink-0"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default MovieSearch;