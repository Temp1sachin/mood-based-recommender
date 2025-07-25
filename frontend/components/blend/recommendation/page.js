'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import socket from '../../../lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Cpu, Plus, Film, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
// A simple, themed loading spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-12">
    <LoaderCircle className="w-8 h-8 text-purple-400 animate-spin" />
  </div>
);

const RecommendationsPage = () => {
  const { roomId } = useParams();
  const [token, setToken] = useState('');
  
  // Your original state is preserved
  const [friendRecs, setFriendRecs] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [friendLoading, setFriendLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  // Your original fetching functions are preserved
  const fetchFriendRecs = async () => {
    setFriendLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/blend/${roomId}/internal-recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRecs(res.data.recommendations);
    } catch (err) {
      console.error(err);
      // Consider using a toast notification instead of alert for better UX
      toast.error("Could not load recommendations from friends.");
    } finally {
      setFriendLoading(false);
    }
  };

  const fetchAiRecs = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post(`http://localhost:8000/blend/${roomId}/ai-recommendations`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAiRecs(res.data.recommendations.map(title => ({ title, genres: ['AI Suggestion'] })));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Could not get AI recommendations."); // Changed from alert
    } finally {
      setAiLoading(false);
    }
  };
  
  // Your original socket function is preserved
  const addMovieToBlend = (movie) => {
    socket.emit('playlist-add-movie', {
      roomId,
      // You may need a more robust way to get this ID
      playlistId: 'YOUR_FIRST_PLAYLIST_ID', 
      movie: {
        title: movie.title,
        description: movie.description || 'Added from recommendations.',
        genres: movie.genres,
      },
    });
    // Consider using a toast notification for a less disruptive message
    toast.success(`Added "${movie.title}" to the blend!`);
  };

  // The rendering logic is now restyled into animated cards
  const renderRecs = (recs, isLoading) => {
    if (isLoading) return <LoadingSpinner />;
    if (recs.length === 0) return (
      <p className="text-center text-gray-500 p-8">
        No recommendations to show yet. Click the button to fetch them!
      </p>
    );

    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="visible"
      >
        {recs.map((movie, index) => (
          <motion.div
            key={`${movie.title}-${index}`}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 flex justify-between items-center h-full group">
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <Film className="h-6 w-6 text-purple-400 flex-shrink-0" />
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-gray-200 truncate">{movie.title}</h4>
                  <p className="text-xs text-gray-400 truncate">
                    {Array.isArray(movie.genres) ? movie.genres.join(', ') : 'N/A'}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                onClick={() => addMovieToBlend(movie)}
                className="bg-pink-600/20 text-pink-400 border border-pink-600/50 hover:bg-pink-600/40 hover:text-pink-300 transition-all rounded-full ml-4 h-9 w-9"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="w-full min-h-full p-2 md:p-4 bg-[#0d0d0d] text-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          Get Recommendations
        </h1>
        <p className="text-gray-500">Discover media based on your group's taste or from our AI.</p>
      </div>

      <Tabs defaultValue="friends" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 p-1 h-auto rounded-lg">
          <TabsTrigger value="friends" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md py-2">
            <Users className="mr-2 h-4 w-4" /> From Friends
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md py-2">
            <Cpu className="mr-2 h-4 w-4" /> AI-Powered
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="friends">
          <Card className="bg-transparent border-none mt-4">
            <CardContent className="text-center p-4 md:p-6">
              <h2 className="text-xl font-bold text-gray-200">Discover Movies from Your Group</h2>
              <p className="text-gray-400 my-2">See what movies are popular in your friends' personal playlists.</p>
              <Button onClick={fetchFriendRecs} disabled={friendLoading} className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 disabled:opacity-50 mt-2">
                {friendLoading ? 'Loading...' : 'Fetch Friends\' Picks'}
              </Button>
              {renderRecs(friendRecs, friendLoading)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="bg-transparent border-none mt-4">
            <CardContent className="text-center p-4 md:p-6">
              <h2 className="text-xl font-bold text-gray-200">Get New Ideas from Gemini</h2>
              <p className="text-gray-400 my-2">Let our AI analyze your group's taste and suggest something entirely new.</p>
              <Button onClick={fetchAiRecs} disabled={aiLoading} className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 disabled:opacity-50 mt-2">
                {aiLoading ? 'Thinking...' : 'Ask Gemini'}
              </Button>
              {renderRecs(aiRecs, aiLoading)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecommendationsPage;