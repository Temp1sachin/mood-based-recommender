'use client';

import { useEffect, useState } from 'react';
import PlaylistCard from './PlaylistCard';

export default function PlaylistGallery() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [coverImage, setCoverImage] = useState(null);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/playlist/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setPlaylists(data.playlists);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePlaylist = async (playlistId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8000/playlist/${playlistId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', newName);
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      const res = await fetch('http://localhost:8000/playlist/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setPlaylists(data.playlists);
        setShowModal(false);
        setNewName('');
        setCoverImage(null);
      } else {
        alert(data.error || 'Failed to create playlist');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Playlists</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + Create Playlist
        </button>
      </div>

      {loading ? (
        
        <p>Loading...</p>
      ) : Array.isArray(playlists) && playlists.length === 0 ? (
        <p className="text-gray-600">No playlists found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl._id}
              name={pl.name}
              coverImage={pl.coverImage}
              onDelete={() => deletePlaylist(pl._id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-black rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4 text-white">Create Playlist</h2>
            <input
              type="text"
              placeholder="Playlist Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
              className="w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
