'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Heart } from 'lucide-react'; // Import the Heart icon

export default function MovieCard({ movie, playlistId, onDelete }) {
  // State to track if the movie is favorited, for instant UI feedback
  const [isFavorited, setIsFavorited] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${movie.title}" from this playlist?`);
    if (!isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://localhost:8000/playlist/${playlistId}/movie/${movie._id}/delete`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(`"${movie.title}" has been removed from the playlist!`);
        onDelete(movie._id);
      } else {
        toast.error(data.error || 'Failed to delete movie');
      }
    } catch (err) {
      console.error('Error deleting movie:', err);
      toast.error('Something went wrong');
    }
  };

  // Function to handle adding a movie to favorites
  const handleFavorite = async (e) => {
    e.stopPropagation(); // Prevent card click event
    const token = localStorage.getItem('token');
    if (!token) {
      return toast.error("You must be logged in to add favorites.");
    }

    try {
      const res = await fetch('http://localhost:8000/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: movie.title,
          poster: movie.poster,
          description: movie.description,
          genres: movie.genres,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`"${movie.title}" added to your favorites!`);
        setIsFavorited(true); // Fill the heart icon
      } else {
        // Handle cases where it might already be a favorite
        toast.info(data.message || 'Could not add to favorites.');
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      toast.error('Something went wrong.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-black to-pink-800 rounded-xl p-4 shadow-xl border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300 hover:shadow-2xl hover:scale-105 relative group w-72 h-96">
      <div className="relative mb-4 overflow-hidden rounded-lg bg-black/20">
        <img 
          src={movie.poster || '/default-movie.jpg'} 
          alt={movie.title} 
          className="w-full h-56 object-contain rounded-lg transition-transform duration-300 group-hover:scale-110"
          onError={(e) => { e.target.src = '/default-movie.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="space-y-3 flex flex-col h-24">
        <h3 className="text-base font-bold text-pink-200 truncate">{movie.title}</h3>
        
        <div className="relative">
          <p className="text-sm text-purple-200 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-full left-0 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-3 z-20 shadow-lg border border-pink-400/30 mb-2 max-w-xs">
            {movie.description || 'No description available'}
          </p>
          <p className="text-sm text-purple-200 line-clamp-1 leading-relaxed flex-1">
            {movie.description ? movie.description.substring(0, 50) + '...' : 'No description available'}
          </p>
        </div>
        
        {movie.genres && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {(() => {
              let genresArray = [];
              if (typeof movie.genres === 'string') {
                genresArray = movie.genres.split(',').map(g => g.trim());
              } else if (Array.isArray(movie.genres)) {
                genresArray = movie.genres;
              }
              return genresArray.slice(0, 2).map((genre, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-pink-600/20 text-pink-300 rounded-full border border-pink-400/30"
                >
                  {genre}
                </span>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        className="absolute top-3 left-3 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
        title="Add to Favorites"
      >
        <Heart size={16} className={isFavorited ? 'text-pink-500 fill-current' : ''} />
      </button>

      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-2 bg-red-600/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
          title="Delete Movie"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
