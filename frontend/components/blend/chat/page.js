'use client';

import { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'next/navigation';
import socket from '../../../lib/socket';
import { UserContext } from '../../../context/UserContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Sparkles } from 'lucide-react';

const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const GeminiLoadingIndicator = () => (
  <motion.div
    className="flex items-center gap-3 p-2 ml-2"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-1.5">
      <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
      <span className="text-sm font-medium text-gray-400">Gemini is thinking...</span>
    </div>
    <div className="flex gap-1.5">
      <motion.div className="h-2 w-2 rounded-full bg-purple-500" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="h-2 w-2 rounded-full bg-purple-500" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
      <motion.div className="h-2 w-2 rounded-full bg-purple-500" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
    </div>
  </motion.div>
);


const Chat = () => {
  const { user } = useContext(UserContext);
  const { roomId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [token, setToken] = useState('');
  const initialFetchDone = useRef(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!roomId || !token || initialFetchDone.current) return;
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/blend/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.room && res.data.room.chatHistory) {
          setMessages(res.data.room.chatHistory);
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
      } finally {
        initialFetchDone.current = true;
      }
    };
    fetchChatHistory();
  }, [roomId, token]);

  useEffect(() => {
    if (!socket || !roomId || !user) return;
    socket.emit('join-blend-room', { roomId, user });

    const handleReceiveMessage = (newMessage) => {
      // DEBUG: Log every message received from the socket.
      console.log("DEBUG: Received message from socket:", newMessage);

      // ROBUST FIX: Check sender case-insensitively and stop the loader.
      if (newMessage.sender?.toLowerCase() === 'gemini') {
        console.log("DEBUG: Gemini response detected. Hiding loader.");
        setIsGeminiLoading(false);
      }
      
      if (newMessage.sender !== user.email) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [roomId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGeminiLoading]);

  const sendMessage = async () => {
    if (!message.trim() || !user || !token) return;

    if (message.toLowerCase().includes('@gemini')) {
      // DEBUG: Confirm the loader is being triggered.
      console.log("DEBUG: Gemini trigger detected. Showing loader.");
      setIsGeminiLoading(true);
    }
    
    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      message,
      sender: user.email,
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    setMessage('');

    const chatData = { roomId, message, sender: user.email };
    socket.emit('chat-message', chatData);

    try {
      await axios.post('http://localhost:8000/blend/chat/message', { roomId, message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] text-gray-200">
      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, idx) => {
          const isSender = msg.sender === user?.email;
          const isGemini = msg.sender?.toLowerCase() === 'gemini'; // Robust check

          return (
            <motion.div
              key={msg._id || idx}
              className={`flex items-end gap-2.5 ${
                isSender ? 'justify-end' : isGemini ? 'justify-center' : 'justify-start'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className={`flex flex-col max-w-lg w-full ${
                isSender ? 'items-end' : isGemini ? 'items-center' : 'items-start'
              }`}>
                {!isSender && !isGemini && (
                  <span className="text-xs text-purple-400/80 px-1 mb-1">{msg.sender}</span>
                )}
                {isGemini && (
                  <span className="text-xs text-cyan-400 font-bold px-1 mb-1 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    Gemini
                  </span>
                )}
                
                <div className={`px-4 py-2.5 rounded-2xl w-auto ${
                  isSender 
                    ? 'bg-gradient-to-br from-pink-600 to-pink-500 text-white rounded-br-none' 
                    : isGemini
                      ? 'bg-gradient-to-br from-purple-900 to-indigo-900 text-gray-200 text-center border border-purple-700/50'
                      : 'bg-gray-800 text-gray-300 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                
                <span className="text-xs text-gray-500 mt-1 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {isGeminiLoading && <GeminiLoadingIndicator />}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      <motion.div 
        className="mt-4 flex gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <input
          className="flex-1 px-5 py-2.5 bg-gray-800 border border-purple-800/60 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500/80 focus:border-pink-500 transition-all placeholder:text-gray-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Blend your thoughts... (try @gemini)"
        />
        <motion.button
          className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          onClick={sendMessage}
          disabled={!message.trim()}
          whileTap={{ scale: 0.95 }}
        >
          <SendHorizonal size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Chat;