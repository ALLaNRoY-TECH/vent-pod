const mongoose = require('mongoose');

const flaggedMessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  classification: { type: String, enum: ['FLAGGED', 'CRITICAL'], required: true },
  socketId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FlaggedMessage', flaggedMessageSchema);
