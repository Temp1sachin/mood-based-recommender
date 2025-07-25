'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';

// Icons
import { Home, User, Heart, Globe, LogOut, Music, LoaderCircle } from 'lucide-react';

const Sidebar = () => {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  const handleCreateBlendRoom = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      toast.error("You're not logged in. Token is missing.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await axios.post(
        "/api/blend/create",
        {},
        {
          headers: {
            "Authorization": `Bearer ${currentToken}`,
          },
        }
      );
      
      const { roomId } = response.data;
      toast.success("New Blend Room created! Taking you there...");

      // THE FIX: Use window.location.href for a full page reload.
      // This is the most forceful way to clear any client-side caching.
      setTimeout(() => {
        window.location.href = `/blend/${roomId}`;
      }, 700); // A slightly longer buffer to feel intentional

    } catch (error) {
      console.error("Failed to create room:", error.response?.data?.error || error.message);
      toast.error(error.response?.data?.error || "Failed to create room.");
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    toast.success("You have been logged out.");
    router.push('/auth');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-[#0d0d0d] text-gray-300 transition-all duration-300 ease-in-out hover:w-60 group z-20 border-r border-purple-900/50">
      <div className="flex h-full flex-col justify-between p-3">
        {/* Top section */}
        <div>
          <div className="flex items-center justify-center h-16 mb-4">
            <Music size={32} className="text-pink-500" />
          </div>
          <button
            onClick={handleCreateBlendRoom}
            disabled={isCreating} // Disable button while creating
            className="flex items-center justify-center group-hover:justify-start w-full p-3 my-2 rounded-lg cursor-pointer bg-gradient-to-r from-pink-600/80 to-purple-600/80 text-white font-semibold transition-all duration-300 hover:from-pink-600 hover:to-purple-600 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCreating ? (
                <LoaderCircle size={28} className="animate-spin flex-shrink-0" />
            ) : (
                <Globe size={28} className="flex-shrink-0" />
            )}
            <span className="ml-4 overflow-hidden whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-full transition-all duration-200">
              {isCreating ? 'Creating...' : 'Create Blend'}
            </span>
          </button>
          <nav className="mt-6 space-y-2">
            <Link href="/dashboard" className="flex items-center justify-center group-hover:justify-start w-full p-3 rounded-lg hover:bg-purple-900/50 transition-colors">
              <Home size={28} className="flex-shrink-0" />
              <span className="ml-4 overflow-hidden whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-full transition-all duration-200">
                Home
              </span>
            </Link>
            <Link href="/profile" className="flex items-center justify-center group-hover:justify-start w-full p-3 rounded-lg hover:bg-purple-900/50 transition-colors">
              <User size={28} className="flex-shrink-0" />
              <span className="ml-4 overflow-hidden whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-full transition-all duration-200">
                Profile
              </span>
            </Link>
            <Link href="/favorites" className="flex items-center justify-center group-hover:justify-start w-full p-3 rounded-lg hover:bg-purple-900/50 transition-colors">
              <Heart size={28} className="flex-shrink-0" />
              <span className="ml-4 overflow-hidden whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-full transition-all duration-200">
                Favorites
              </span>
            </Link>
          </nav>
        </div>
        {/* Bottom section */}
        <div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center group-hover:justify-start w-full p-3 rounded-lg hover:bg-purple-900/50 transition-colors"
          >
            <LogOut size={28} className="flex-shrink-0" />
            <span className="ml-4 overflow-hidden whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-full transition-all duration-200">
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;