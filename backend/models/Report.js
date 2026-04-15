const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedUser: { type: String, required: true }, // socketId
  reporterUser: { type: String, required: true }, // socketId
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
