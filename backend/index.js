const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // ⬅️ NEW
const { Server } = require('socket.io'); // ⬅️ NEW
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authRoutes = require('./routes/Auth');
const EmoMovies = require('./routes/Movies');
const playlist = require('./routes/Playlist');
const recommendHandler = require('./routes/Recmmend');
const BlendInvite = require('./models/BlendInvite');
const BlendRoom = require('./models/BlendRoom');
const User = require('./models/User');

const app = express();
const server = http.createServer(app); // ⬅️ use HTTP server for Socket.io

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const io = new Server(server, {
  cors: {
    origin: '*', // set frontend URL in production
    methods: ['GET', 'POST'],
  },
});

const connectedUsers = new Map(); // email -> socket.id

// ✅ WebSocket Events
io.on('connection', (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  socket.on('register-user', (email) => {
    connectedUsers.set(email, socket.id);
    console.log(`📩 Registered: ${email} -> ${socket.id}`);
  });

  socket.on('send-invite', async ({ toEmail, fromEmail, roomId }) => {
    const targetSocketId = connectedUsers.get(toEmail);
    try {
      // Find sender and receiver users
      const sender = await User.findOne({ email: fromEmail });
      const receiver = await User.findOne({ email: toEmail });
      if (!sender || !receiver) return;
      // Create BlendInvite in DB
      await BlendInvite.create({
        roomId,
        senderId: sender._id,
        receiverId: receiver._id,
        status: 'pending',
      });
      if (targetSocketId) {
        io.to(targetSocketId).emit('receive-invite', { fromEmail, roomId });
        console.log(`📨 Invite from ${fromEmail} to ${toEmail} for room ${roomId}`);
      } else {
        console.log(`❌ ${toEmail} is not connected.`);
        // Notify sender that user is not connected
        const senderSocketId = connectedUsers.get(fromEmail);
        if (senderSocketId) {
          io.to(senderSocketId).emit('user-not-connected', { toEmail });
        }
      }
    } catch (err) {
      console.error('Error sending invite:', err);
    }
  });

  // Respond to invite (accept/reject)
  socket.on('respond-invite', async ({ toEmail, fromEmail, roomId, accepted }) => {
    try {
      const sender = await User.findOne({ email: fromEmail });
      const receiver = await User.findOne({ email: toEmail });
      if (!sender || !receiver) return;
      // Update BlendInvite status
      const invite = await BlendInvite.findOneAndUpdate(
        { roomId, senderId: sender._id, receiverId: receiver._id },
        { status: accepted ? 'accepted' : 'rejected' },
        { new: true }
      );
      const senderSocketId = connectedUsers.get(fromEmail);
      if (senderSocketId) {
        io.to(senderSocketId).emit('invite-response', { toEmail, roomId, accepted });
      }
      if (accepted) {
        // Add receiver to BlendRoom participants
        await BlendRoom.findOneAndUpdate(
          { roomId },
          { $addToSet: { participants: receiver._id } }
        );
        // Fetch updated room with populated participants and emit
const updatedRoom = await BlendRoom.findOne({ roomId }).populate(
  'participants',
  'fullName email profilePic _id'
);

io.to(roomId).emit('participants-update', {
  participants: updatedRoom.participants.map(p => p.toObject()),
});

        // Join both users to the socket.io room
        const receiverSocketId = connectedUsers.get(toEmail);
        if (receiverSocketId) {
          io.sockets.sockets.get(receiverSocketId)?.join(roomId);
        }
        if (senderSocketId) {
          io.sockets.sockets.get(senderSocketId)?.join(roomId);
        }
      }
    } catch (err) {
      console.error('Error responding to invite:', err);
    }
  });

  // Join a room (for collaborative features)
  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });
// In index.js, inside io.on('connection', ...)

socket.on('chat-message', async ({ roomId, message, sender }) => {
  try {
    // --- 1. Save and Broadcast the User's Original Message ---
    console.log(`Message from ${sender} in ${roomId}: ${message}`);

    // Find the room to save the chat history
    const room = await BlendRoom.findOne({ roomId });
    if (!room) return;

    // Save the user's message to the database
    room.chatHistory.push({ sender, message });
    await room.save();

    // Broadcast the user's message to everyone else in the room
    socket.to(roomId).emit('receive-message', { message, sender });

    // --- 2. Check if the Message is a Prompt for Gemini ---
    if (message.includes('@')) {
      console.log('🤖 Gemini prompt detected. Getting response...');
      
      const prompt = message; // Use the whole message as the prompt
      const result = await geminiModel.generateContent(prompt);
      const geminiResponse = await result.response.text();

      if (geminiResponse) {
        // --- 3. Save and Broadcast Gemini's Response ---
        const aiSender = 'Gemini';

        // Save Gemini's response to the database
        room.chatHistory.push({ sender: aiSender, message: geminiResponse });
        await room.save();

        // Broadcast Gemini's response to EVERYONE in the room (including the sender)
        io.to(roomId).emit('receive-message', { message: geminiResponse, sender: aiSender });
        console.log(`🤖 Gemini response sent to room ${roomId}`);
      }
    }
  } catch (error) {
    console.error('Error in chat-message handler:', error);
    // Optionally emit an error back to the user
    socket.emit('chat-error', { message: 'Could not process your message.' });
  }
});

  // --- BLEND ROOM SOCKET EVENTS ---
  socket.on('join-blend-room', async ({ roomId, user }) => {
    try {
      // Find user by email
      const dbUser = await User.findOne({ email: user.email });
      if (!dbUser) return;
      // Add user to BlendRoom participants if not already present
      let room = await BlendRoom.findOne({ roomId });
      if (!room) return;
      const userId = dbUser._id.toString();
      console.log('👥 Updated participants list:', room.participants);
      if (!room.participants.map(id => id.toString()).includes(userId)) {
        room.participants.push(userId);
        await room.save();
        console.log('👥 Updated participants list:', room.participants);
      }
      socket.join(roomId);
      // Fetch the room again and populate participants
      room = await BlendRoom.findOne({ roomId }).populate('participants', 'fullName email profilePic _id');
      io.to(roomId).emit('participants-update', {
        participants: room.participants.map(p => p.toObject()),
      });
      console.log('📤 Emitting participants:', room.participants.map(p => p.email));

    } catch (err) {
      console.error('Error in join-blend-room:', err);
    }
  });

  // In index.js

// In index.js

socket.on('leave-blend-room', async ({ roomId, user }) => {
  try {
    // ✅ ADD THIS CHECK to ensure 'user' exists before you use it
    if (!user || !user.email) {
      console.error('❌ "leave-blend-room" event received without a valid user object.');
      return; // Stop the function if the user data is missing
    }

    // This line is now safe
    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) return;
    
    let room = await BlendRoom.findOne({ roomId });
    if (!room) return;

    // ... rest of your existing logic ...
    
    const userId = dbUser._id.toString();
    room.participants = room.participants.filter(
      id => id.toString() !== userId
    );
    
    if (room.participants.length === 0) {
      await BlendRoom.deleteOne({ roomId });
      io.to(roomId).emit('participants-update', { participants: [] });
    } else {
      await room.save();
      room = await BlendRoom.findOne({ roomId }).populate('participants', 'fullName email profilePic _id');
      io.to(roomId).emit('participants-update', {
        participants: room.participants.map(p => p.toObject()),
      });
    }

    socket.leave(roomId);
    
  } catch (err) {
    console.error('Error in leave-blend-room:', err);
  }
});
  socket.on('playlist-add-movie', async ({ roomId, playlistId, movie }) => {
    try {
      const room = await BlendRoom.findOne({ roomId });
      if (!room) return;

      const playlist = room.playlist.id(playlistId);
      if (!playlist) return;
      
      // You can even include your TMDB poster fetching logic here if you want
      playlist.movies.push(movie);
      await room.save();

      // Broadcast the updated playlist to everyone in the room
      io.to(roomId).emit('playlist-updated', playlist);
      console.log(`🎵 Movie added to playlist ${playlistId} in room ${roomId}`);

    } catch (err) {
      console.error('Error adding movie via socket:', err);
    }
  });

  // Listen for a user deleting a movie
  socket.on('playlist-delete-movie', async ({ roomId, playlistId, movieId }) => {
    try {
      const room = await BlendRoom.findOne({ roomId });
      if (!room) return;

      const playlist = room.playlist.id(playlistId);
      if (!playlist) return;

      playlist.movies.pull(movieId);
      await room.save();

      // Broadcast the updated playlist to everyone in the room
      io.to(roomId).emit('playlist-updated', playlist);
      console.log(`🎵 Movie deleted from playlist ${playlistId} in room ${roomId}`);

    } catch (err) {
      console.error('Error deleting movie via socket:', err);
    }
  });
  // In index.js inside io.on('connection', ...)

  // Listen for a user deleting a whole playlist
  socket.on('delete-playlist', async ({ roomId, playlistId }) => {
    try {
      const room = await BlendRoom.findOne({ roomId });
      if (!room) return;

      room.playlist.pull(playlistId);
      await room.save();

      // Broadcast the updated list of playlists to the room
      io.to(roomId).emit('room-playlists-updated', room.playlist);
      console.log(`🗑️ Playlist ${playlistId} deleted in room ${roomId}`);

    } catch (err) {
      console.error('Error deleting playlist via socket:', err);
    }
  });

  socket.on('disconnect', () => {
    for (let [email, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(email);
        console.log(`🔴 Disconnected: ${email}`);
        break;
      }
    }
  });
});
const blendRoutes = require('./routes/blend')(io);

// ✅ Express Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ status: 'ok' });
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/detect', EmoMovies);
app.use('/playlist', playlist);
app.use('/blend', blendRoutes);
app.use('/mood', recommendHandler);

mongoose.connect('mongodb://localhost:27017/moodapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// ✅ Start Server (use `server.listen` not `app.listen`)
server.listen(8000, () => console.log('🚀 Server running on port 8000'));
