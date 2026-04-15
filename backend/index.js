require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const Chat = require('./models/Chat');
const Report = require('./models/Report');
const FlaggedMessage = require('./models/FlaggedMessage');

const { moderationService } = require('./services/moderation');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// We use a queue-based matchmaking system with scope for mood-based filtering.
let waitingQueue = [];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ventpod', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join matchmaking queue
  socket.on('find_match', ({ mood }) => {
    // Basic match logic: Pair first available or push to queue
    // Has scope for mood-based filtering in the future
    const partnerIndex = waitingQueue.findIndex(u => u.socketId !== socket.id);
    
    if (partnerIndex !== -1) {
      const partner = waitingQueue.splice(partnerIndex, 1)[0];
      const roomId = `room_${Date.now()}`;
      
      socket.join(roomId);
      io.sockets.sockets.get(partner.socketId)?.join(roomId);
      
      socket.emit('match_found', { roomId, partnerMood: partner.mood, role: 'stranger' });
      io.to(partner.socketId).emit('match_found', { roomId, partnerMood: mood, role: 'stranger' });
    } else {
      waitingQueue.push({ socketId: socket.id, mood });
    }
  });

  // Handle messages
  socket.on('send_message', async ({ roomId, message }) => {
    // 1. Intercept Message -> Send to Moderation API
    const classification = await moderationService(message);

    if (classification === 'SAFE') {
      // Broadcast to partner only (Optimistic UI handles sender's view)
      socket.to(roomId).emit('receive_message', {
        sender: socket.id,
        content: message,
        timestamp: new Date()
      });
      
      // Acknowledge back to sender that it's safe
      socket.emit('message_ack', { content: message });
      
      // Asynchronously log to DB
      try {
        await Chat.updateOne(
          { room: roomId },
          { $push: { messages: { sender: socket.id, content: message } } },
          { upsert: true }
        );
      } catch (err) {
        console.error('Error saving message:', err);
      }
    } else {
      // Message is FLAGGED or CRITICAL
      // Log flagged message to Database
      try {
        await new FlaggedMessage({
          content: message,
          classification,
          socketId: socket.id
        }).save();
      } catch(err) {
        console.error('Error saving flagged message:', err);
      }

      if (classification === 'FLAGGED') {
        socket.emit('message_warning', { 
          message: 'Your message may violate safety guidelines and was not sent.' 
        });
      } else if (classification === 'CRITICAL') {
        socket.emit('critical_alert', { 
          message: 'You are not alone. Please consider reaching out for help.'
        });
      }
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
         socket.to(roomId).emit('partner_left');
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
