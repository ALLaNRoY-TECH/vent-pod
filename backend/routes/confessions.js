const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// GET /api/confessions
// Fetch posts ordered by newest first, with their corresponding comments
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 }).limit(50).lean();
    
    // Fetch comments for these posts
    const postIds = posts.map(p => p._id);
    const comments = await Comment.find({ postId: { $in: postIds } }).sort({ timestamp: 1 }).lean();
    
    // Attach comments to each post
    const postsWithComments = posts.map(post => {
      post.comments = comments.filter(c => String(c.postId) === String(post._id));
      return post;
    });

    res.json(postsWithComments);
  } catch (err) {
    console.error('Error fetching confessions:', err);
    res.status(500).json({ error: 'Server error fetching confessions' });
  }
});

// POST /api/confessions
// Create a new post
router.post('/', async (req, res) => {
  try {
    const { content, song } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const newPost = new Post({ content, song });
    const savedPost = await newPost.save();
    
    // Return post format with empty comments array
    const result = savedPost.toObject();
    result.comments = [];
    
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating confession:', err);
    res.status(500).json({ error: 'Server error creating confession' });
  }
});

// POST /api/confessions/:id/react
// React to a post
router.post('/:id/react', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'felt_this', 'same', or 'stay_strong'

    const validTypes = ['felt_this', 'same', 'stay_strong'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.reactions[type] += 1;
    await post.save();

    res.json({ success: true, reactions: post.reactions });
  } catch (err) {
    console.error('Error reacting:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/confessions/:id/comment
// Leave a comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = new Comment({ postId: id, content });
    const savedComment = await newComment.save();

    res.status(201).json(savedComment);
  } catch (err) {
    console.error('Error commenting:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
