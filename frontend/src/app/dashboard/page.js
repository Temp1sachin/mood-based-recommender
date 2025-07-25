'use client';

import { useEffect, useState } from 'react';
import ChromaGrid from './components/ChromaGrid';
import Sidebar from './components/Sidebar';
import Carousel from './components/Carousel';
import FaceEmotionDetector from './components/EmotionDetect';
import PlaylistDetail from './components/PlaylistDetail';

// Imports for the new UI
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, PlusCircle, Upload, Search, X } from 'lucide-react';
import { toast } from 'sonner';
 const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function Dashboard() {
  // --- YOUR ORIGINAL STATE AND LOGIC (100% PRESERVED) ---
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [coverImg, setCoverImg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDetector, setShowDetector] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/playlist/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setPlaylists(data.playlists || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('Please enter a playlist name');

    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('name', newName.trim());
    if (coverImg) fd.append('coverImage', coverImg);

    try {
      const r = await fetch(`${API_URL}/playlist/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to create');

      setPlaylists(d.playlists);
      setShowModal(false);
      setNewName('');
      setCoverImg(null);
      toast.success(`Playlist "${newName.trim()}" created!`);
    } catch (e) {
      toast.error(e.message);
      console.error(e);
    }
  };

  const handleDelete = async (playlistId) => {

    setDeletingId(playlistId);
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/playlist/${playlistId}/delete`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to delete');
        setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
        toast.success("Playlist deleted.");
      } catch (err) {
        console.error('Delete error:', err);
        toast.error('Failed to delete playlist.');
      } finally {
        setDeletingId(null);
      }
    }, 300);
  };

  const chromaItems = [
    {
      image: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png',
      title: 'Create Playlist',
      subtitle: 'Start something new',
      onClick: () => setShowModal(true)
    },
    ...playlists.map(p => ({
      image: p.coverImage || '/default.jpg',
      title: p.name,
      subtitle: '',
      playlistId: p._id,
      onClick: () => setSelectedPlaylist(p),
      onDelete: () => handleDelete(p._id)
    }))
  ];

  const handleSearch = async (query) => {
    const token = localStorage.getItem('token');
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/playlist/movie/data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const filtered = data.filter((movie) =>
        movie.movie_name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleAddToPlaylist = async (movie) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${API_URL}/playlist/${selectedPlaylist._id}/add-movie`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: movie.movie_name,
            description: movie.Description,
            genres: movie.genres,
            poster: movie.poster || '',
            rating: ''
          })
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success(`"${movie.movie_name}" added to playlist!`);

        const updated = await fetch(`${API_URL}/playlist/${selectedPlaylist._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedData = await updated.json();

        if (updatedData.playlist && updatedData.playlist._id) {
          setSelectedPlaylist(updatedData.playlist);
          setSearchQuery('');
          setSearchResults([]);
        } else {
          console.error('Invalid playlist data', updatedData);
        }
      } else {
        toast.error(data.error || 'Failed to add movie');
      }
    } catch (err) {
      console.error('Add movie error:', err);
      toast.error('Something went wrong!');
    }
  };
  // --- END OF YOUR ORIGINAL LOGIC ---


  // --- NEW RENDER LOGIC WITH THEMED UI ---

  // Renders the Playlist Detail view when a playlist is selected
  if (selectedPlaylist) {
    return (
      <div className="w-full min-h-screen p-4 bg-[#0d0d0d] text-gray-200">
        <Button
          onClick={() => {
            setSelectedPlaylist(null);
            setSearchQuery('');
            setSearchResults([]);
          }}
          variant="outline" className="mb-6 bg-transparent border-gray-700 hover:bg-gray-800 hover:text-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="relative mb-6 max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search movies to add..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-800 border-2 border-purple-800/60 rounded-full focus:ring-2 focus:ring-pink-500/80 focus:border-pink-500 transition-all placeholder:text-gray-500"
            />
        </div>

        {/* This calls your original PlaylistDetail component */}
        <PlaylistDetail
          key={selectedPlaylist._id + searchResults.length}
          playlistId={selectedPlaylist._id}
          playlistName={selectedPlaylist.name}
        />

        {searchQuery && (
          <div className="mt-6 max-w-4xl mx-auto">
            <h2 className="text-xl mb-2 text-white">Search Results:</h2>
            <div className="space-y-3">
              {searchResults.map((movie, index) => (
                <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-800/50 flex items-center justify-between gap-4">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-gray-100 truncate">{movie.movie_name}</h3>
                    <p className="text-sm text-purple-400 truncate">{movie.genres}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToPlaylist(movie)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renders the main Dashboard view
  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-gray-200 font-sans">
      <Sidebar />
      
      <main className="flex-1 pl-0 md:pl-20 lg:pl-24 transition-all duration-500">
        <div className="p-6">
          {/* Centered Header */}
          <div className="text-center my-8">
            <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-700 drop-shadow-lg">Dashboard</h1>
            <p className="text-lg text-pink-200">Welcome to your mood‑based music dashboard 🎶</p>
          </div>

          {loading ? (
            <p className="mt-10 text-center text-pink-300 animate-pulse">Loading playlists…</p>
          ) : (
            <>
              <div className="flex justify-center my-8">
                <Carousel
                  baseWidth={960} autoplay autoplayDelay={3000} pauseOnHover loop round={false}
                  setShowDetector={setShowDetector}
                />
              </div>
              <div className="w-full flex justify-center">
                <div className="w-full max-w-5xl bg-gradient-to-br from-black via-purple-900 to-pink-700 rounded-3xl border-2 border-pink-400 shadow-2xl p-6 animate-fade-in-up transition-all duration-700">
                  <ChromaGrid
                    items={chromaItems} columns={3} rows={2} radius={300} damping={0.45} fadeOut={0.6} ease="power3.out"
                    deletingId={deletingId}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Styled Modals */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-2xl border border-purple-700/50"
            >
              <h2 className="mb-4 text-xl font-bold text-pink-200">Create New Playlist</h2>
              <div className="space-y-4">
                <Input
                  type="text" placeholder="Playlist name" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-pink-500 focus:border-pink-500 h-12"
                />
                <label htmlFor="cover-image-input" className="cursor-pointer bg-gray-800 border border-gray-700 rounded-md p-2 h-12 flex items-center justify-center text-gray-400 hover:border-pink-500 transition-colors">
                  <Upload className="h-5 w-5 mr-2"/>
                  <span className="truncate">{coverImg ? coverImg.name : 'Upload Cover Image'}</span>
                </label>
                <Input
                  id="cover-image-input" type="file" accept="image/*" onChange={(e) => setCoverImg(e.target.files[0])}
                  className="hidden"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)} className="bg-transparent border-gray-700 hover:bg-gray-800">
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="bg-pink-600 text-white hover:bg-pink-700">
                  Create
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showDetector && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-xl shadow-2xl overflow-y-auto relative border border-purple-700/50"
            >
              <Button onClick={() => setShowDetector(false)} variant="ghost" size="icon" className="absolute top-3 right-3 text-gray-400 hover:text-white hover:bg-gray-700 z-10">
                <X/>
              </Button>
              <div className="p-6">
                <FaceEmotionDetector />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}