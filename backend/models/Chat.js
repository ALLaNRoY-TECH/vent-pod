const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  room: { type: String, required: true },
  messages: [{
    sender: { type: String, required: true }, // socketId or 'system'
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now, expires: '24h' } // auto delete after 24h
});

module.exports = mongoose.model('Chat', chatSchema);
