'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ListMusic, Heart, LoaderCircle } from 'lucide-react';
import Image from 'next/image';

const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d0d0d] text-center">
        <LoaderCircle className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading Profile...</p>
    </div>
);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          setLoading(false);
          // Optionally redirect or show an error toast
          return;
      }
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
        // Optionally show an error toast
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!user) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d0d0d] text-center text-red-400 text-xl font-semibold">
        User not found.
        <Button onClick={() => router.push('/auth')} className="mt-4">Go to Login</Button>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#0d0d0d] text-gray-200 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="mb-8 bg-transparent border-gray-700 hover:bg-gray-800 hover:text-gray-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <div className="w-full bg-gray-900/50 border border-purple-800/50 rounded-2xl shadow-xl shadow-purple-900/10 p-8 flex flex-col md:flex-row items-center text-center md:text-left gap-8">
                <div className="flex-shrink-0">
                    <Image
                      src={user.profilePic || '/images/placeholder.png'}
                      alt="Profile Picture"
                      width={160}
                      height={160}
                      className="w-40 h-40 rounded-full object-cover border-4 border-pink-400 shadow-lg bg-gray-800"
                    />
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-700 drop-shadow-lg mb-2">
                      {user.fullName}
                    </h1>
                    <p className="text-pink-200/80 font-medium mb-6">{user.email}</p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 mt-4">
                        <div className="flex items-center gap-3 text-lg">
                            <ListMusic className="h-6 w-6 text-purple-400"/>
                            <span className="font-semibold text-gray-300">Playlists:</span>
                            <span className="font-bold text-pink-400">{user.playlists?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg">
                            <Heart className="h-6 w-6 text-pink-400"/>
                            <span className="font-semibold text-gray-300">Favorites:</span>
                            <span className="font-bold text-pink-400">{user.favorites?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
