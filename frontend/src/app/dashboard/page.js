'use client';

import { useEffect, useState } from 'react';
import ChromaGrid from './components/ChromaGrid';
import Sidebar from './components/Sidebar';
import Carousel from './components/Carousel';
import FaceEmotionDetector from './components/EmotionDetect';
import PlaylistDetail from './components/PlaylistDetail';

export default function Dashboard() {
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
        const res = await fetch('http://localhost:8000/playlist/all', {
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
    if (!newName.trim()) return alert('Enter a playlist name');

    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('name', newName.trim());
    if (coverImg) fd.append('coverImage', coverImg);

    try {
      const r = await fetch('http://localhost:8000/playlist/create', {
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
    } catch (e) {
      alert(e.message);
      console.error(e);
    }
  };

  const handleDelete = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    setDeletingId(playlistId);
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/playlist/${playlistId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to delete');
        setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete playlist.');
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
      const res = await fetch('http://localhost:8000/playlist/movie/data', {
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
        `http://localhost:8000/playlist/${selectedPlaylist._id}/add-movie`,
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
        alert(`"${movie.movie_name}" added to playlist!`);

        const updated = await fetch(`http://localhost:8000/playlist/${selectedPlaylist._id}`, {
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
        alert(data.error || 'Failed to add movie');
      }
    } catch (err) {
      console.error('Add movie error:', err);
      alert('Something went wrong!');
    }
  };

  if (selectedPlaylist) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-black via-purple-900 to-pink-700">
        <button
          onClick={() => {
            setSelectedPlaylist(null);
            setSearchQuery('');
            setSearchResults([]);
          }}
          className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-700 via-pink-600 to-purple-900 text-white rounded shadow hover:from-pink-700 hover:to-purple-700 transition"
        >
          ← Back to Playlists
        </button>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="p-2 rounded border border-gray-300 w-1/2"
          />
        </div>

        <PlaylistDetail
          key={selectedPlaylist._id + searchResults.length}
          playlistId={selectedPlaylist._id}
          playlistName={selectedPlaylist.name}
        />

        {searchQuery && (
  <div className="mt-6">
    <h2 className="text-xl mb-2">Search Results:</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {searchResults.map((movie, index) => (
        <div key={index} className="bg-zinc-800 p-4 rounded relative">
          <h3 className="font-bold text-white">{movie.movie_name}</h3>
          <p className="text-gray-400 text-sm">{movie.genres}</p>
          <p className="text-gray-400 text-xs mt-1">{movie.Description}</p>
          <button
            onClick={() => handleAddToPlaylist(movie)}
            className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-sm"
          >
            + Add
          </button>
        </div>
      ))}
    </div>
  </div>
)}

      </div>
    );
  }

  return (
    
    <div className="flex min-h-screen bg-gradient-to-br from-black via-purple-900 to-pink-700">
      <Sidebar />
     {showDetector && (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto p-6">
    <div className="w-full max-w-6xl max-h-[90vh] bg-zinc-900 rounded-xl shadow-2xl overflow-y-auto p-6 relative">
      <button
        onClick={() => setShowDetector(false)}
        className="absolute top-4 right-4 text-white hover:text-red-500 text-xl z-10"
      >
        ×
      </button>
      <FaceEmotionDetector />
    </div>
  </div>
)}
      <main className="flex-1 pl-0 md:pl-20 lg:pl-24 transition-all duration-500">
        <div className="p-6">
          <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-700 drop-shadow-lg">Dashboard</h1>
          <p className="text-lg text-pink-200 mb-6">Welcome to your mood‑based music dashboard 🎶</p>

          {loading ? (
            <p className="mt-10 text-center text-pink-300 animate-pulse">Loading playlists…</p>
          ) : (
            <>
              <div className="flex justify-center my-8">
                <Carousel
                  baseWidth={960}
                  autoplay
                  autoplayDelay={3000}
                  pauseOnHover
                  loop
                  round={false}
                  setShowDetector={setShowDetector}
                />
              </div>
              <div className="w-full flex justify-center">
                <div className="w-full max-w-5xl bg-gradient-to-br from-black via-purple-900 to-pink-700 rounded-3xl border-2 border-pink-400 shadow-2xl p-6 animate-fade-in-up transition-all duration-700">
                  <ChromaGrid
                    items={chromaItems}
                    columns={3}
                    rows={2}
                    radius={300}
                    damping={0.45}
                    fadeOut={0.6}
                    ease="power3.out"
                    deletingId={deletingId}
                  />
                </div>
              </div>
            </>
          )}

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-xl bg-gradient-to-br from-purple-900 via-black to-pink-800 p-6 shadow-2xl border-2 border-pink-400">
                <h2 className="mb-4 text-xl font-bold text-pink-200">Create Playlist</h2>
                <input
                  type="text"
                  placeholder="Playlist name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mb-3 w-full rounded border border-purple-700 bg-black/60 text-white p-2 placeholder-pink-300 focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImg(e.target.files[0])}
                  className="mb-4 w-full text-pink-200 file:bg-pink-600 file:text-white file:rounded file:px-3 file:py-1 file:border-none file:mr-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded border border-pink-400 px-4 py-2 text-pink-200 bg-black/40 hover:bg-pink-900/30 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="rounded bg-gradient-to-r from-purple-700 via-pink-600 to-purple-900 px-4 py-2 text-white font-semibold shadow hover:from-pink-700 hover:to-purple-700 transition"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
