"use client";
import { useEffect, useState } from "react";
import ChromaGrid from "./ChromaGrid"; // Make sure path is correct
 const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/playlist/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPlaylists(data.playlists);
      } catch (err) {
        console.error('Failed to fetch playlists:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', newName);
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      const res = await fetch(`${API_URL}/playlist/create`, {
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

  const chromaItems = [
    {
      image: "https://cdn-icons-png.flaticon.com/512/1828/1828817.png",
      title: "Create Playlist",
      subtitle: "Start something new",
      isCreate: true,
      borderColor: "#22C55E",
      gradient: "linear-gradient(145deg, #22C55E, #000)",
      onClick: () => setShowModal(true),
    },
    ...playlists.map((p) => ({
        playlistId: p._id,
      image: p.coverImage || "/default.jpg",
      title: p.name,
      subtitle: "", // You can include a date or tracks count here
      borderColor: "#0EA5E9",
      gradient: "linear-gradient(135deg, #0EA5E9, #000)",
      url: `http://localhost:3000/playlist/${p._id}`, // Or null if no redirection needed
    })),
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Playlists</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ChromaGrid
          items={chromaItems}
          columns={3}
          rows={2}
          className="mb-6"
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Playlist</h2>
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
