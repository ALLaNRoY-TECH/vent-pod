require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const Chat = require('./models/Chat');
const Report = require('./models/Report');
const FlaggedMessage = require('./models/FlaggedMessage');

const { moderateMessage } = require('./services/moderation');
const confessionRoutes = require('./routes/confessions');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/confessions', confessionRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// We use a queue-based matchmaking system with scope for mood-based filtering.
let waitingQueue = [];
const userWarnings = {}; // Memory mapped strike tracker
const chatTimers = {}; // Track room 10-minute timers

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ventpod', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining matching queue
  socket.on('find_match', ({ mood }) => {
    console.log(`User ${socket.id} looking for match with mood: ${mood}`);
    
    // Reset user strike memory accurately for new chat session
    userWarnings[socket.id] = 0;
    
    // Basic match logic: Pair first available or push to queue
    // Has scope for mood-based filtering in the future
    const partnerIndex = waitingQueue.findIndex(u => u.socketId !== socket.id && u.mood === mood);
    
    if (partnerIndex !== -1) {
      const partner = waitingQueue.splice(partnerIndex, 1)[0];
      const roomId = `room_${Date.now()}`;
      
      socket.join(roomId);
      io.sockets.sockets.get(partner.socketId)?.join(roomId);
      
      socket.emit('match_found', { roomId, partnerMood: partner.mood, role: 'stranger' });
      io.to(partner.socketId).emit('match_found', { roomId, partnerMood: mood, role: 'stranger' });

      // Start 10-minute timer for the room
      chatTimers[roomId] = setTimeout(() => {
        io.to(roomId).emit('session_ended', { message: 'Session ended. Take care.' });
        const s1 = io.sockets.sockets.get(socket.id);
        const s2 = io.sockets.sockets.get(partner.socketId);
        if (s1) s1.leave(roomId);
        if (s2) s2.leave(roomId);
        delete chatTimers[roomId];
      }, 10 * 60 * 1000); // 10 minutes
    } else {
      waitingQueue.push({ socketId: socket.id, mood });
    }
  });

  // Handle messages
  socket.on('send_message', async (data) => {
    try {
      console.log("Incoming message:", data);

      const text = data.text || data.message || "";
      const roomId = data.room || data.roomId;

      if (!text || !roomId) {
        console.log("Malformed payload dropped");
        return;
      }

      const result = await moderateMessage(text);
      console.log("Moderation result:", result);

      if (result === "SAFE") {
        console.log(`[Socket] SAFE message delivered`);
        data.sender = socket.id; // Append sender ID for UI coloring
        io.to(roomId).emit("receive_message", data);
        
        try {
          await Chat.updateOne(
            { room: roomId },
            { $push: { messages: { sender: socket.id, content: text } } },
            { upsert: true }
          );
        } catch (err) { }
      } 
      else if (result === "FLAGGED") {
        userWarnings[socket.id] = (userWarnings[socket.id] || 0) + 1;
        const strikes = userWarnings[socket.id];
        
        try { await new FlaggedMessage({ content: text, classification: result, socketId: socket.id }).save(); } catch(err){}
        
        // Auto de-escalation system instead of sending message or basic warning
        socket.emit('deescalate_suggestion', { 
          original: text, 
          suggestion: "I'm feeling frustrated right now" 
        });

        if (strikes >= 3) {
           // handled in enforce logic
        } else if (strikes === 2) {
           socket.emit('final_warning', { message: 'Final warning before ban.', count: strikes });
        }
      }
      else if (result === "CRITICAL") {
        socket.emit("critical_alert", { message: "We detected a serious concern. Please consider seeking help.", showHelp: true });
        userWarnings[socket.id] = (userWarnings[socket.id] || 0) + 2;
        const strikes = userWarnings[socket.id];
        try { await new FlaggedMessage({ content: text, classification: result, socketId: socket.id }).save(); } catch(err){}
        
        if (strikes === 2) {
           socket.emit('final_warning', { message: 'Final warning. Next violation will result in a ban.', count: strikes });
        }
      }

      // BAN ENFORCEMENT logic strictly applies after evaluations
      const currentStrikes = userWarnings[socket.id] || 0;
      if (currentStrikes >= 3) {
        socket.emit("banned", { message: "You have been banned due to repeated violations" });
        io.to(roomId).emit("partner_banned");
        setTimeout(() => {
          socket.disconnect(true);
        }, 500);
      }

    } catch (err) {
      console.error("Moderation pipeline error:", err);
    }
  });

  // Handle typing status
  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('typing_status', { sender: socket.id, isTyping });
  });

  // Handle reporting
  socket.on('report_user', async ({ reportedUser, reason }) => {
    try {
      const report = new Report({ reportedUser, reporterUser: socket.id, reason });
      await report.save();
      socket.emit('report_success', { message: 'User reported successfully.' });
    } catch (err) {
      console.error('Error reporting user:', err);
    }
  });

  // Handle leaving chat
  socket.on('leave_chat', ({ roomId }) => {
    socket.to(roomId).emit('partner_left');
    socket.leave(roomId);
    
    // Clear timer
    if (chatTimers[roomId]) {
      clearTimeout(chatTimers[roomId]);
      delete chatTimers[roomId];
    }

    // Remove from queue if waiting
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    // Notify all rooms the socket was in
    // io.to will broadcast to others in the same room
    socket.rooms.forEach(roomId => {
      if(roomId !== socket.id) {
         if (chatTimers[roomId]) {
            clearTimeout(chatTimers[roomId]);
            delete chatTimers[roomId];
         }
         socket.to(roomId).emit('partner_left');
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server ready - warm before demo`);
});
