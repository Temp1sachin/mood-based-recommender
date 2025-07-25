'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from "sonner";
import socket from '../../../../lib/socket';
import { UserContext } from '../../../../context/UserContext';
import ChatPage from '../../../../components/blend/chat/page';
import PlaylistManager from '../../../../components/blend/playlist/page';
import RecommendationsPage from '../../../../components/blend/recommendation/page';

// Import UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, UserPlus, Users, Music, MessageSquare, Star } from 'lucide-react'; // Added more icons for flair

export default function BlendRoom() {
  const router = useRouter();
  const { roomId } = useParams();
  const { user } = useContext(UserContext);
  
  const [participants, setParticipants] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // This useEffect handles joining/leaving the socket room and updating participants
  useEffect(() => {
    function handleParticipantsUpdate({ participants: updatedParticipants }) {
      setParticipants(Array.isArray(updatedParticipants) ? updatedParticipants : []);
    }

    if (user && roomId) {
      socket.emit('join-blend-room', { roomId, user });
    }

    socket.on('participants-update', handleParticipantsUpdate);

    return () => {
      if (user && roomId) {
        socket.emit('leave-blend-room', { roomId, user });
      }
      socket.off('participants-update', handleParticipantsUpdate);
    };
  }, [roomId, user]);

  // This useEffect handles invite-related notifications
  useEffect(() => {
    function handleUserNotConnected({ toEmail }) {
      toast.error(`${toEmail} is not online. Invite could not be delivered in real-time.`);
    }

    socket.on('user-not-connected', handleUserNotConnected);
    return () => {
      socket.off('user-not-connected', handleUserNotConnected);
    };
  }, []);

  const handleSearch = async (e) => {
    const email = e.target.value;
    setQuery(email);
    if (!email) return setResults([]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/auth/search?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults(data.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Search failed');
    }
  };

  const handleInvite = (invitedUserEmail) => {
    if (user?.email && invitedUserEmail) {
      socket.emit('send-invite', {
        toEmail: invitedUserEmail,
        fromEmail: user.email,
        roomId,
      });
      toast.success(`Invitation sent to ${invitedUserEmail}!`);
      setQuery('');
      setResults([]);
    } else {
      toast.error('Could not send invite. Missing user info.');
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
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to leave room');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error leaving the room');
    }
  };

  return (
    // ✨ Main container with a dark background
    <div className="min-h-screen w-full bg-[#0d0d0d] text-gray-200 flex justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* ✨ Header Card with Gradient Title */}
        <Card className="bg-transparent border-none shadow-none">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Blend Room
              </h1>
              <p className="text-purple-400/80 mt-1 font-mono text-sm">Room ID: {roomId}</p>
            </div>
            <Button onClick={handleLeaveRoom} className="bg-pink-600/20 text-pink-400 border border-pink-600/50 hover:bg-pink-600/40 hover:text-pink-300 transition-all">
              <LogOut className="mr-2 h-4 w-4" />
              Leave Room
            </Button>
          </div>
        </Card>

        {/* ✨ Participants & Invite Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Participants Card */}
          <Card className="lg:col-span-1 bg-gray-900/50 border border-purple-800/50 shadow-lg shadow-purple-900/10">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-100">
                <Users className="mr-2 h-5 w-5 text-purple-400" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {participants.map((p) => (
                <div key={p._id || p.email} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={p.profilePic} alt={p.fullName} />
                    <AvatarFallback className="bg-purple-500 text-white">{p.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-gray-200">{p.fullName}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Invite Card */}
          <Card className="lg:col-span-2 bg-gray-900/50 border border-pink-800/50 shadow-lg shadow-pink-900/10">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-100">
                <UserPlus className="mr-2 h-5 w-5 text-pink-400" />
                Invite Friends
              </CardTitle>
              <CardDescription className="text-gray-400">Search by email to invite users to the blend.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Search user by email..."
                value={query}
                onChange={handleSearch}
                className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-pink-500 focus:border-pink-500"
              />
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {results.map((resultUser) => (
                  <div
                    key={resultUser._id}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={resultUser.profilePic} alt={resultUser.fullName} />
                        <AvatarFallback className="bg-pink-500 text-white">{resultUser.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-gray-200">{resultUser.fullName}</p>
                        <p className="text-xs text-gray-400">{resultUser.email}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleInvite(resultUser.email)} className="bg-pink-600 text-white hover:bg-pink-700 transition-colors">
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✨ Collaboration Area with Styled Tabs */}
        <Tabs defaultValue="playlist" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 p-1 h-auto rounded-lg">
            <TabsTrigger value="playlist" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">
              <Music className="mr-2 h-4 w-4" /> Collaborative Playlist
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">
              <MessageSquare className="mr-2 h-4 w-4" /> Chat & AI
            </TabsTrigger>
            <TabsTrigger value="recommend" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">
              <Star className="mr-2 h-4 w-4" /> Recommendations
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="playlist">
              <Card className="bg-gray-900/50 border border-gray-800">
                <CardContent className="p-6">
                  <PlaylistManager />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chat">
              <Card className="bg-gray-900/50 border border-gray-800">
                <CardContent className="p-2 sm:p-4">
                  <ChatPage />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommend">
              <Card className="bg-gray-900/50 border border-gray-800">
                <CardContent className="p-6">
                  <RecommendationsPage />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}