'use client';

import { useEffect, useState } from 'react';
import ChromaGrid from './components/ChromaGrid';
import Sidebar from './components/Sidebar';
import Carousel from './components/Carousel';
import FaceEmotionDetector from './components/EmotionDetect';


export default function Dashboard() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [coverImg, setCoverImg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDetector, setShowDetector] = useState(false);


  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const r = await fetch('http://localhost:8000/playlist/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = await r.json();
        setPlaylists(d.playlists || []);
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
      borderColor: '#22C55E',
      gradient: 'linear-gradient(145deg,#22C55E,#000)',
      onClick: () => setShowModal(true)
    },
    ...playlists.map(p => ({
      image: p.coverImage || '/default.jpg',
      title: p.name,
      subtitle: '',
      borderColor: '#0EA5E9',
      gradient: 'linear-gradient(135deg,#0EA5E9,#000)',
      url: `/playlist/${p._id}`,
      playlistId: p._id,
      onDelete: () => handleDelete(p._id)
    }))
  ];

  return (
    <>
      {showDetector ? (
        <div className="p-6">
          <button
            onClick={() => setShowDetector(false)}
            className="mb-4 px-4 py-2 bg-gray-700 text-white rounded"
          >
            ← Back to Dashboard
          </button>
          <FaceEmotionDetector />
        </div>
      ) : (
        <div className="p-6">
          <Sidebar />
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome to your mood‑based music dashboard 🎶</p>
  
          {loading ? (
            <p className="mt-10 text-center">Loading playlists…</p>
          ) : (
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="flex justify-center my-8">
                <Carousel
                  baseWidth={960}
                  autoplay={true}
                  autoplayDelay={3000}
                  pauseOnHover={true}
                  loop={true}
                  round={false}
                  setShowDetector={setShowDetector}
                />
              </div>
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
          )}
  
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold">Create Playlist</h2>
  
                <input
                  type="text"
                  placeholder="Playlist name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mb-3 w-full rounded border p-2"
                />
  
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImg(e.target.files[0])}
                  className="mb-4 w-full"
                />
  
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded border px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
  
}
