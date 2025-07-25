'use client';

import { useState, useEffect } from 'react';
import socket from '../../../lib/socket'; // Adjust path if needed
import MovieSearch from './MovieSearch';

// Imports for the new UI
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { ArrowLeft, Plus, Trash2, Film } from 'lucide-react';

const PlaylistDetail = ({
  playlist,
  onBack,
  onAddMovie,
  onDeleteMovie,
  token,
  setSelectedPlaylist,
  setPlaylists,
}) => {
  // --- YOUR ORIGINAL STATE AND LOGIC (100% PRESERVED) ---
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handlePlaylistUpdate = (updatedPlaylist) => {
      console.log('Real-time update received:', updatedPlaylist);
      if (playlist && updatedPlaylist._id === playlist._id) {
          setSelectedPlaylist(updatedPlaylist);
          setPlaylists((prevPlaylists) =>
            prevPlaylists.map((p) =>
              p._id === updatedPlaylist._id ? updatedPlaylist : p
            )
          );
      }
    };
    socket.on('playlist-updated', handlePlaylistUpdate);
    return () => {
      socket.off('playlist-updated', handlePlaylistUpdate);
    };
  }, [playlist, setSelectedPlaylist, setPlaylists]);
  // --- END OF YOUR ORIGINAL LOGIC ---


  // This part is untouched. It will render your original MovieSearch component.
  if (isSearching) {
    return (
      <MovieSearch
        playlist={playlist}
        onAddMovie={onAddMovie}
        onBack={() => setIsSearching(false)}
        token={token}
      />
    );
  }

  // This is the main detail view with the new UI applied.
  return (
    <div className="w-full text-gray-200 p-2">
      <Button onClick={onBack} variant="outline" className="mb-6 bg-transparent border-gray-700 hover:bg-gray-800 hover:text-gray-100">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Playlists
      </Button>

      {/* --- Styled Header --- */}
      <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <Image
          // 👇 FIX 1: Corrected property name for the main cover image
          src={playlist.coverImage || '/images/placeholder.png'}
          alt={`Cover for ${playlist.name}`}
          width={150}
          height={150}
          className="rounded-lg aspect-square object-cover border-4 border-purple-800/50 shadow-lg"
        />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-purple-300">Playlist</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white break-words">{playlist.name}</h1>
          <p className="text-gray-400 mt-2">
            {playlist.movies.length} {playlist.movies.length === 1 ? 'movie' : 'movies'} in this playlist.
          </p>
        </div>
        <Button
            onClick={() => setIsSearching(true)}
            className="bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-all duration-300 transform hover:scale-105 px-6 py-5"
        >
            <Plus className="mr-2 h-5 w-5" /> Add Movies
        </Button>
      </header>

      {/* --- Styled List of Existing Movies --- */}
      <AnimatePresence>
        {playlist.movies.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <Film className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold">This playlist is empty</h3>
            <p>{'Click "Add Movies" to get started!'}</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-3"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="visible"
          >
            {playlist.movies.map((movie) => (
              <motion.div
                key={movie._id}
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                layout
                className="bg-gray-900/50 p-3 rounded-lg border border-gray-800/50 flex items-center justify-between group"
              >
                <div className="flex items-center flex-1 overflow-hidden">
                  {/* 👇 FIX 2: Movie poster image removed as requested */}
                  <div className="overflow-hidden">
                    <h3 className="text-md font-semibold text-gray-100 truncate">{movie.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {movie.genres.map(genre => (
                        <span key={genre} className="text-xs bg-purple-900/80 text-purple-300 px-2 py-0.5 rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDeleteMovie(movie._id)}
                  className="h-9 w-9 rounded-full opacity-40 group-hover:opacity-100 hover:bg-pink-600/50 transition-opacity ml-4"
                >
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistDetail;