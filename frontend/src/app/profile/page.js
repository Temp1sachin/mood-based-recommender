'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ListMusic, Heart, LoaderCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                toast.error("You are not logged in.");
                router.push('/auth');
                return;
            }
            try {
                const res = await fetch(`${API_URL}/api/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setUser(data.user);
            } catch (err) {
                console.error('Failed to load profile:', err);
                toast.error(err.message || 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error("File is too large. Maximum size is 2MB.");
            return;
        }

        setIsUploading(true);
        const uploadToast = toast.loading("Uploading picture...");

        const formData = new FormData();
        formData.append('profilePic', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/auth/update-picture`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed. Please try again.');

            const data = await res.json();
            
            setUser(prevUser => ({ ...prevUser, profilePic: data.profilePicUrl }));
            
            toast.success("Profile picture updated!", { id: uploadToast });

        } catch (err) {
            console.error('Upload failed:', err);
            toast.error(err.message || 'Upload failed.', { id: uploadToast });
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!user) return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d0d0d] text-center text-red-400 text-xl font-semibold">
            User not found or session expired.
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
                    
                    <motion.div 
                        className="flex-shrink-0 relative group"
                        whileHover="hover"
                    >
                        <Image
                            src={user.profilePic || '/images/placeholder.png'}
                            alt="Profile Picture"
                            width={160}
                            height={160}
                            className="w-40 h-40 rounded-full object-cover border-4 border-pink-400 shadow-lg bg-gray-800 transition-all duration-300 group-hover:brightness-50"
                        />
                        
                        <AnimatePresence>
                            {isUploading ? (
                                <motion.div 
                                    className="absolute inset-0 bg-black/70 rounded-full flex justify-center items-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <LoaderCircle className="w-8 h-8 text-pink-400 animate-spin"/>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="absolute inset-0 bg-black/60 rounded-full flex-col justify-center items-center cursor-pointer hidden group-hover:flex"
                                    onClick={() => fileInputRef.current?.click()}
                                    variants={{ hover: { opacity: 1 }, initial: { opacity: 0 } }}
                                    initial="initial"
                                    exit="initial"
                                >
                                    <Camera className="w-8 h-8 text-white mb-2" />
                                    {/* --- Final change here --- */}
                                    <span className="w-3/4 text-white font-semibold text-sm text-center">
                                        Change Profile Picture
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            disabled={isUploading}
                        />
                    </motion.div>

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