'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import socket from '../../../lib/socket'; // Adjust path if needed
import { toast } from 'sonner';
// Your original child component imports are preserved
import PlaylistCard from './PlaylistCard';
import PlaylistDetail from './PlaylistDetail';

// Imports for the new UI
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Upload } from 'lucide-react';
 const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PlaylistManager = () => {
  // --- YOUR ORIGINAL STATE AND LOGIC (100% PRESERVED) ---
  const { roomId } = useParams();
  const [playlists, setPlaylists] = useState([]);
  const [token, setToken] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistCover, setNewPlaylistCover] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      console.error('No token found');
      return;
    }
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (roomId && token) {
      fetchRoomPlaylists();
    }
  }, [roomId, token]);

  useEffect(() => {
    const handlePlaylistsUpdate = (updatedPlaylists) => {
      console.log('Playlist list updated from server:', updatedPlaylists);
      setPlaylists(updatedPlaylists);
    };
    socket.on('room-playlists-updated', handlePlaylistsUpdate);
    return () => socket.off('room-playlists-updated', handlePlaylistsUpdate);
  }, []);

  const fetchRoomPlaylists = async () => {
    try {
      const res = await axios.get(`${API_URL}/blend/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data.room.playlist);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName || !newPlaylistCover) {
      toast.error("Please provide a name and a cover image.");
      return;
    }
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('name', newPlaylistName);
    formData.append('coverImage', newPlaylistCover);
    try {
      await axios.post(`${API_URL}/blend/playlist/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setNewPlaylistName('');
      setNewPlaylistCover(null);
      document.getElementById('cover-image-input').value = '';
      toast.success(`Playlist "${newPlaylistName}" created!`);
    } catch (err) {
      console.error("Error creating playlist:", err);
      toast.error("Failed to create playlist.");
    }
  };

  const deletePlaylist = (playlistId) => {
    
      socket.emit('delete-playlist', { roomId, playlistId });
      toast.success("Playlist deleted.");
    
  };

  const addMovieToPlaylist = (playlistId, movie) => {
    socket.emit('playlist-add-movie', {
      roomId,
      playlistId,
      movie: {
        title: movie.movie_name,
        description: movie.Description,
        genres: movie.genres.split(', '),
      },
    });
    toast.success(`Added "${movie.movie_name}" to playlist!`, {
      duration: 3000,
      style: {
        background: '#1a1a1a',
        color: '#fff',
      },
    });
  };

  const deleteMovieFromPlaylist = (playlistId, movieId) => {
    
      socket.emit('playlist-delete-movie', {
        roomId,
        playlistId,
        movieId,
      });
      toast.success("Movie removed from playlist.");
    
  };
  // --- END OF YOUR ORIGINAL LOGIC ---


  // --- RENDER LOGIC ---

  // This part is untouched. It will render your original PlaylistDetail component.
  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        key={selectedPlaylist._id}
        playlist={selectedPlaylist}
        onBack={() => setSelectedPlaylist(null)}
        onAddMovie={(movie) => addMovieToPlaylist(selectedPlaylist._id, movie)}
        onDeleteMovie={(movieId) => deleteMovieFromPlaylist(selectedPlaylist._id, movieId)}
        token={token}
        setPlaylists={setPlaylists}
        setSelectedPlaylist={setSelectedPlaylist}
      />
    );
  }

  // This is the main view with the new UI applied.
  return (
    <div className="w-full min-h-full p-2 md:p-4 bg-[#0d0d0d] text-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Your Blend Playlists
          </h1>
          <p className="text-gray-500">Create shared playlists and add movies with your friends.</p>
        </div>
        
        {/* Styled "Create Playlist" Form */}
        <div className="bg-gray-900/50 border border-purple-800/50 p-4 md:p-6 mb-8 rounded-lg max-w-4xl mx-auto shadow-lg shadow-purple-900/10">
          <h2 className="text-xl font-semibold mb-4 text-white">Create a New Playlist</h2>
          <form onSubmit={createPlaylist} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist Name"
              className="md:col-span-1 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-pink-500 focus:border-pink-500 h-12"
              required
            />
            {/* Styled File Input */}
            <label htmlFor="cover-image-input" className="md:col-span-1 cursor-pointer bg-gray-800 border border-gray-700 rounded-md p-2 h-12 flex items-center justify-center text-gray-400 hover:border-pink-500 transition-colors">
              <Upload className="h-5 w-5 mr-2"/>
              <span className="truncate">{newPlaylistCover ? newPlaylistCover.name : 'Upload Cover Image'}</span>
            </label>
            <input
              id="cover-image-input"
              type="file"
              accept="image/*"
              onChange={(e) => setNewPlaylistCover(e.target.files[0])}
              className="hidden"
              required
            />
            <Button type="submit" className="md:col-span-1 bg-pink-600 text-white font-semibold hover:bg-pink-700 h-12">
              <PlusCircle className="mr-2 h-5 w-5"/> Create
            </Button>
          </form>
        </div>

        {/* Playlists Grid - Renders your original PlaylistCard component */}
        <AnimatePresence>
          {playlists.length === 0 ? (
            <p className="text-center text-gray-500 py-10">{"You haven't created any playlists yet."}</p>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              initial="hidden"
              animate="visible"
            >
              {playlists.map((pl) => (
                <motion.div key={pl._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  {/* This calls your original PlaylistCard component */}
                  <PlaylistCard
                    playlist={pl}
                    onDelete={() => deletePlaylist(pl._id)}
                    onSelect={() => setSelectedPlaylist(pl)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlaylistManager;