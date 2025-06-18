// src/components/Sidebar.jsx
'use client';
import { Home, User, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="h-screen w-20 hover:w-60 bg-gray-900 text-white transition-all duration-300 fixed z-10">
      <div className="flex flex-col items-center p-4 space-y-6">
        <img src="/vercel.svg" className="w-12 h-12 rounded-full" alt="Profile" />
        <div className="flex flex-col space-y-4 text-sm">
          <a href="/dashboard" className="flex items-center gap-2">
            <Home size={20} />
            <span className="hidden group-hover:block">Home</span>
          </a>
          <a href="/friends" className="flex items-center gap-2">
            <User size={20} />
            <span className="hidden group-hover:block">Friends</span>
          </a>
          <a href="/settings" className="flex items-center gap-2">
            <Settings size={20} />
            <span className="hidden group-hover:block">Settings</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
