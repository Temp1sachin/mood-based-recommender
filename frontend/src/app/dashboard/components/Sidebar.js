'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for client-side navigation
import axios from 'axios';
import { toast } from 'sonner'; // Import toast for notifications

// Icons
import { Home, User, Settings, Globe, LogOut, Music } from 'lucide-react';

const Sidebar = () => {
  const router = useRouter();
  const [token, setToken] = useState(null);

  // Your original logic to get the token is preserved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  // Your original logic for creating a room is preserved
  const handleCreateBlendRoom = async () => {
    console.log("Preparing to create room...");
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      toast.error("You're not logged in. Token is missing.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/blend/create-room",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      console.log("Room created:", response.data);
      const { roomId } = response.data;
      toast.success("Blend Room created! Taking you there...");
      router.push(`/blend/${roomId}`);
    } catch (error) {
      console.error("Failed to create room:", error.response || error);
      toast.error("Failed to create room. Please check the console.");
    }
  };

  // Logout functionality is now implemented
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token"); // Clear the token
    }
    toast.success("You have been logged out.");
    router.push('/auth'); // Redirect to the login page
  };

  return (
    // The main sidebar container with hover effect to expand
    <aside className="fixed left-0 top-0 h-screen w-20 bg-[#0d0d0d] text-gray-300 transition-all duration-300 ease-in-out hover:w-60 group z-20 border-r border-purple-900/50">
      <div className="flex h-full flex-col justify-between p-3">
        {/* Top section with logo and navigation */}
        <div>
          {/* Logo */}
          <div className="flex items-center justify-center h-16 mb-4">
            <Music size={32} className="text-pink-500" />
          </div>

          {/* Main Action Button */}
          <button
            onClick={handleCreateBlendRoom}
            className="flex items-center justify-center group-hover:justify-start w-full p-3 my-2 rounded-lg cursor-pointer bg-gradient-to-r from-pink-600/80 to-purple-600/80 text-white font-semibold transition-all duration-300 hover:from-pink-600 hover:to-purple-600 shadow-lg"
          >
            <Globe size={28} className="flex-shrink-0" />
            <span className="ml-4 overflow-hidden whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-full transition-all duration-200">
              Create Blend
            </span>
          </button>
          
          {/* Navigation Links */}
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
            <Link href="/settings" className="flex items-center justify-center group-hover:justify-start w-full p-3 rounded-lg hover:bg-purple-900/50 transition-colors">
              <Settings size={28} className="flex-shrink-0" />
              <span className="ml-4 overflow-hidden whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-full transition-all duration-200">
                Settings
              </span>
            </Link>
          </nav>
        </div>

        {/* Bottom section for logout */}
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