'use client';

import { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
 const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PlaylistDetail({ playlistId, playlistName, onBack }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/playlist/${playlistId}/movies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMovies(data.movies);
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = (movieId) => {
    setMovies((prev) => prev.filter((movie) => movie._id !== movieId));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
       
          
      
        <h1 className="text-2xl font-bold">{playlistName}</h1>
      </div>

      {loading ? (
        <p>Loading movies...</p>
      ) : movies.length === 0 ? (
        <p className="text-gray-400">No movies in this playlist.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              playlistId={playlistId}
              onDelete={handleDeleteMovie}
            />
          ))}
        </div>
      )}
    </div>
  );
}
