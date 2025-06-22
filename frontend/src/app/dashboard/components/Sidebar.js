// src/components/Sidebar.jsx
"use client";
import { Home, User, Settings, Globe } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

const Sidebar = () => {
  const handleClick = () => (window.location.href = `/blend/${uuidv4()}`);
  return (
    <div className="h-screen w-20 hover:w-60 bg-gradient-to-b from-black via-purple-900 to-pink-700 text-white transition-all duration-300 fixed z-10 shadow-2xl border-r-2 border-purple-700 group">
      <div className="flex flex-col items-center p-4 space-y-8">
        <div className="flex flex-col space-y-6 text-sm w-full">
          <a
            onClick={handleClick}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-700 via-pink-600 to-purple-900 hover:from-pink-700 hover:to-purple-700 transition-all duration-200 cursor-pointer shadow-md"
          >
            <Globe size={25} className="text-pink-300 group-hover:text-purple-300 transition-colors duration-200" />
            <span className="font-bold text-pink-200 group-hover:text-purple-200 hidden group-hover:inline">Blend</span>
          </a>
          <div className="flex flex-col space-y-4 text-sm w-full">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-800 via-black to-pink-800 hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow"
            >
              <Home size={20} className="text-purple-300 group-hover:text-pink-300 transition-colors duration-200" />
              <span className="font-semibold text-purple-200 group-hover:text-pink-200 hidden group-hover:inline">Home</span>
            </a>
            <a
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-800 via-black to-pink-800 hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow"
            >
              <User size={20} className="text-purple-300 group-hover:text-pink-300 transition-colors duration-200" />
              <span className="font-semibold text-purple-200 group-hover:text-pink-200 hidden group-hover:inline">Profile</span>
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-800 via-black to-pink-800 hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow"
            >
              <Settings size={20} className="text-purple-300 group-hover:text-pink-300 transition-colors duration-200" />
              <span className="font-semibold text-purple-200 group-hover:text-pink-200 hidden group-hover:inline">Settings</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
