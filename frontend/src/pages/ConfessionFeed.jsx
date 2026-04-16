import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, MessageCircle, Send } from 'lucide-react';

// Utility to convert raw links to embed links
const getEmbedUrl = (url) => {
  if (!url) return null;
  const spotifyMatch = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) return `https://open.spotify.com/embed/track/${spotifyMatch[1]}?utm_source=generator&theme=0`;
  
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return null;
};

export default function ConfessionFeed() {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');
  const [showSongInput, setShowSongInput] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch from env or fallback to localhost
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const API_URL = `${BASE_URL}/api/confessions`;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      // Simulate slight network delay for smooth skeleton UX
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, song: { url: newSongUrl } })
      });
      if (res.ok) {
        setNewContent('');
        setNewSongUrl('');
        setShowSongInput(false);
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to post', err);
    }
  };

  const handleReact = async (postId, type) => {
    try {
      const res = await fetch(`${API_URL}/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error('Failed to react', err);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`${API_URL}/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText })
      });
      if (res.ok) {
        setCommentText('');
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to comment', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-20">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-3">Anonymous Feed</h1>
        <p className="text-slate-400">Share your thoughts to the void. No accounts, no judgment.</p>
      </div>

      {/* Create Post Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-lg mb-8"
      >
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="What's on your mind?..."
            className="w-full bg-dark-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all resize-none h-28"
          />
          
          <AnimatePresence>
            {showSongInput && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <input
                  type="text"
                  value={newSongUrl}
                  onChange={(e) => setNewSongUrl(e.target.value)}
                  placeholder="Paste Spotify or YouTube link here..."
                  className="w-full bg-dark-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-accent-500 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={() => setShowSongInput(!showSongInput)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showSongInput ? 'bg-accent-600/20 text-accent-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Music size={16} /> Attach Song
            </button>
            
            <button
              type="submit"
              disabled={!newContent.trim()}
              className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2"
            >
              Post <Send size={16} />
            </button>
          </div>
        </form>
      </motion.div>

      {/* Feed Stream */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-md animate-pulse">
                <div className="h-4 bg-slate-700/50 rounded-full w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-700/50 rounded-full w-1/2 mb-6"></div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 border-t border-slate-700/50 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 bg-slate-700/40 rounded-full w-16"></div>
                    <div className="h-8 bg-slate-700/40 rounded-full w-16"></div>
                    <div className="h-8 bg-slate-700/40 rounded-full w-24"></div>
                  </div>
                  <div className="h-4 bg-slate-700/50 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {posts.map((post) => {
              const embedUrl = post.song?.url ? getEmbedUrl(post.song.url) : null;
              const isCommenting = activeCommentPost === post._id;

              return (
                <motion.div 
                  layout
                  key={post._id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-md transition-all duration-300 hover:border-slate-600/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] group hover:-translate-y-0.5"
                >
              <p className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap mb-4">
                {post.content}
              </p>

              {embedUrl && (
                <div className="mb-5 rounded-xl overflow-hidden border border-slate-800 bg-dark-900 shadow-inner">
                  <iframe 
                    src={embedUrl} 
                    width="100%" 
                    height="80" 
                    frameBorder="0" 
                    allow="encrypted-media" 
                    title="Embedded Music"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 border-t border-slate-700/50 pt-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleReact(post._id, 'felt_this')} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-full transition">
                    Heart <span className="font-semibold text-accent-400">{post.reactions?.felt_this || 0}</span>
                  </button>
                  <button onClick={() => handleReact(post._id, 'same')} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-full transition">
                    Same <span className="font-semibold text-accent-400">{post.reactions?.same || 0}</span>
                  </button>
                  <button onClick={() => handleReact(post._id, 'stay_strong')} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-full transition">
                    Stay Strong <span className="font-semibold text-accent-400">{post.reactions?.stay_strong || 0}</span>
                  </button>
                </div>

                <button 
                  onClick={() => setActiveCommentPost(isCommenting ? null : post._id)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                >
                  <MessageCircle size={16} />
                  {post.comments?.length || 0} Comments
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {isCommenting && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="bg-dark-900/50 rounded-xl p-4 border border-slate-700 border-t-0 space-y-3">
                      {post.comments?.length > 0 ? (
                        post.comments.map(comment => (
                          <div key={comment._id} className="text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-slate-500 text-xs mr-2">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-slate-300">{comment.content}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No comments yet. Be the first.</p>
                      )}
                      
                      <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex gap-2 mt-4 pt-2 border-t border-slate-700/50">
                        <input
                          type="text"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Reply anonymously..."
                          className="flex-1 bg-dark-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                        />
                        <button type="submit" disabled={!commentText.trim()} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition">
                          <Send size={14} />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && posts.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-slate-500">
            It's quiet here. Be the first to confess something.
          </motion.div>
        )}
      </div>
    </div>
  );
}
