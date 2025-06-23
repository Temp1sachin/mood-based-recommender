'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function BlendRoom() {
  const router = useRouter();
  const { roomId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    let intervalId;

    const fetchParticipants = async () => {
      const res = await fetch('http://localhost:8000/blend/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ roomId })
      });
      const { room } = await res.json();
      setParticipants(room.participants);
      setCount(room.participants.length);
    };

    fetchParticipants(); // initial fetch

    intervalId = setInterval(fetchParticipants, 3000); // poll every 3 seconds

    const leaveOnUnload = () => {
      fetch('http://localhost:8000/blend/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ roomId })
      });
    };
    window.addEventListener('beforeunload', leaveOnUnload);
    return () => {
      window.removeEventListener('beforeunload', leaveOnUnload);
      leaveOnUnload();
      clearInterval(intervalId);
    };
  }, [roomId]);

   const handleSearch = async (e) => {
    const email = e.target.value;
    setQuery(email);
    if (!email) return setResults([]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/auth/search?email=${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setResults(data.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Search failed');
    }
  };
  
  const handleInvite = async (invitedUserId) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8000/blend/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId, invitedUserId }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success('Invitation sent!');
    } else {
      toast.error(data.error || 'Failed to send invite');
    }
  } catch (err) {
    console.error(err);
    toast.error('An error occurred while sending the invite');
  }
};

const handleLeaveRoom = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8000/blend/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      router.push('/dashboard'); // or wherever you want to redirect
    } else {
      toast.error(data.error || 'Failed to leave room');
    }
  } catch (err) {
    console.error(err);
    toast.error('Error leaving the room');
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-pink-700 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-xl bg-black bg-opacity-80 rounded-2xl shadow-2xl p-8 border-2 border-purple-700">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-700 mb-4 text-center drop-shadow-lg">
          Blend Room: <span className="text-white">{roomId}</span>
        </h1>
        <p className="text-lg text-pink-200 font-medium mb-6 text-center">
          Participants: <span className="text-purple-400 font-bold">{count}</span>
        </p>
        <input
          type="text"
          placeholder="Search user by email"
          value={query}
          onChange={handleSearch}
          className="w-full p-3 mb-6 rounded-xl border-2 border-purple-600 bg-zinc-900 text-pink-200 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-200 shadow-inner"
        />
        <button
  onClick={handleLeaveRoom}
  className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
>
  Leave Room
</button>
        <div className="space-y-4">
          {results.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center bg-gradient-to-r from-purple-800 via-black to-pink-800 text-white p-4 rounded-xl shadow-lg border border-purple-700 hover:scale-[1.02] transition-transform duration-150"
            >
              <div>
                <p className="font-bold text-lg text-pink-300 drop-shadow-sm">{user.fullName}</p>
                <p className="text-sm text-purple-200">{user.email}</p>
              </div>
              <button
                onClick={() => handleInvite(user._id)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 px-5 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                Invite
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
