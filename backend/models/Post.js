const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  song: {
    url: { type: String, default: '' },
    title: { type: String, default: '' },
    thumbnail: { type: String, default: '' }
  },
  reactions: {
    felt_this: { type: Number, default: 0 },
    same: { type: Number, default: 0 },
    stay_strong: { type: Number, default: 0 }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);
