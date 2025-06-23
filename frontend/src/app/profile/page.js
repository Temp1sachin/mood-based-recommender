// === FRONTEND: Profile Page (React with Tailwind) ===
'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:8000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6 text-center text-pink-400 text-xl font-semibold">Loading...</div>;
  if (!user) return <div className="p-6 text-center text-red-400 text-xl font-semibold">User not found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-pink-700 py-10 px-4">
      <div className="w-full max-w-2xl bg-black bg-opacity-80 rounded-2xl shadow-2xl p-8 border-2 border-purple-700 flex flex-col items-center">
        <img
          src={user.profilePic || '/default.png'}
          alt="Profile"
          className="w-40 h-40 rounded-full object-contain border-4 border-pink-400 shadow-lg mb-6 mt-2 bg-black"
        />
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-700 drop-shadow-lg text-center mb-2">
          {user.fullName}
        </h2>
        <p className="text-pink-200 font-medium text-center mb-8">{user.email}</p>
        <div className="w-full mt-4">
          <h3 className="text-lg font-bold text-purple-300 mb-2 text-center">Playlists Created: <span className="text-pink-400">{user.playlists?.length || 0}</span></h3>
        </div>
      </div>
    </div>
  );
}