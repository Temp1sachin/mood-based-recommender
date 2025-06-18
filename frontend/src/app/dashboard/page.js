'use client';

import { useEffect, useState } from 'react';
import ChromaGrid from './components/ChromaGrid';

export default function Dashboard() {
  /* ───────────────────────────── state ───────────────────────────── */
  const [playlists, setPlaylists]  = useState([]);      // user playlists
  const [loading,   setLoading]    = useState(true);    // data fetch spinner
  const [showModal, setShowModal]  = useState(false);   // create‑playlist dialog
  const [newName,   setNewName]    = useState('');      // form – name
  const [coverImg,  setCoverImg]   = useState(null);    // form – file object

  /* ──────────────────────── initial fetch ───────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const r  = await fetch('http://localhost:8000/playlist/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d  = await r.json();
        setPlaylists(d.playlists || []);
      } catch (e) { console.error(e); }
      finally     { setLoading(false); }
    })();
  }, []);

  /* ─────────────────────── playlist creator ─────────────────────── */
  const handleCreate = async () => {
    if (!newName.trim()) { alert('Enter a playlist name'); return; }

    const token    = localStorage.getItem('token');
    const fd       = new FormData();
    fd.append('name', newName.trim());
    if (coverImg) fd.append('coverImage', coverImg);

    try {
      const r  = await fetch('http://localhost:8000/playlist/create', {
        method : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body   : fd
      });
      const d  = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to create');

      /* backend returns fresh list */
      setPlaylists(d.playlists);
      setShowModal(false);
      setNewName('');
      setCoverImg(null);
    } catch (e) {
      alert(e.message);
      console.error(e);
    }
  };

  /* ───── assemble items for ChromaGrid (＋ card always first) ───── */
  const chromaItems = [
    {
      image     : 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png',
      title     : 'Create Playlist',
      subtitle  : 'Start something new',
      borderColor: '#22C55E',
      gradient  : 'linear-gradient(145deg,#22C55E,#000)',
      onClick   : () => setShowModal(true)
    },
    ...playlists.map(p => ({
      image     : p.coverImage || '/default.jpg',
      title     : p.name,
      subtitle  : '',
      borderColor: '#0EA5E9',
      gradient  : 'linear-gradient(135deg,#0EA5E9,#000)',
      url       : `/playlist/${p._id}`
    }))
  ];

  /* ──────────────────────────── render ──────────────────────────── */
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg text-gray-600">Welcome to your mood‑based music dashboard 🎶</p>

      {loading ? (
        <p className="mt-10 text-center">Loading playlists…</p>
      ) : (
        <div className="max-h-[80vh] overflow-y-auto">
          <ChromaGrid
            items   ={chromaItems}
            columns ={3}
            rows   = {2}
            radius = {300}
            damping= {0.45}
            fadeOut ={0.6}
            ease  =  "power3.out"
          />
        </div>
      )}

      {/* ───────────── modal ───────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Create Playlist</h2>

            <input
              type="text"
              placeholder="Playlist name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="mb-3 w-full rounded border p-2"
            />

            <input
              type="file"
              accept="image/*"
              onChange={e => setCoverImg(e.target.files[0])}
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
  );
}
