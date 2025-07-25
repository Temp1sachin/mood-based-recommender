'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { Heart, Trash2, LoaderCircle, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import { Button } from '@/components/ui/button'; // Import Button for consistency

// A simple, themed loading spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-12">
    <LoaderCircle className="w-8 h-8 text-purple-400 animate-spin" />
  </div>
);

export default function FavoritesPage() {
  const router = useRouter(); // Initialize router
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false); // No token, no need to load
      toast.error("You must be logged in to see your favorites.");
    }
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:8000/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(res.data.favorites);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        toast.error("Could not load your favorites.");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [token]);

  const handleRemoveFavorite = async (movieId, movieTitle) => {
    if (!token) return toast.error("You are not logged in.");
    try {
      // Note the updated URL to include the movieId
      const res = await axios.delete(`http://localhost:8000/favorites/remove/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.favorites); // Update state with the new list from the server
      toast.success(`"${movieTitle}" removed from favorites.`);
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      toast.error("Failed to remove movie from favorites.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0d0d] text-gray-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back to Dashboard Button */}
        <Button
          onClick={() => router.push('/dashboard')}
          variant="outline"
          className="mb-8 bg-transparent border-gray-700 hover:bg-gray-800 hover:text-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Your Favorites
          </h1>
          <p className="text-lg text-gray-400">All the movies you love, in one place.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <AnimatePresence>
            {favorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-500 py-16"
              >
                <Heart className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-2xl font-semibold">Your favorites list is empty</h3>
                <p>Add some movies to see them here!</p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                initial="hidden"
                animate="visible"
              >
                {favorites.map((movie) => (
                  <motion.div
                    key={movie._id} // Use the unique _id from the database
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    layout
                    className="bg-gray-900/50 rounded-lg overflow-hidden group border border-purple-800/30 shadow-lg shadow-purple-900/10"
                  >
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={movie.poster || '/images/poster-placeholder.png'}
                        alt={`Poster for ${movie.title}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                      <button
                        onClick={() => handleRemoveFavorite(movie._id, movie.title)}
                        className="absolute top-2 right-2 h-9 w-9 bg-black/50 text-pink-400 hover:bg-pink-600/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all rounded-full z-10 flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="font-bold text-lg text-white truncate">{movie.title}</h3>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
