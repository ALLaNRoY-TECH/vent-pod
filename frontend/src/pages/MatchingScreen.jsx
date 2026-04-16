import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { socket } from '../utils/socket'
import { AlertTriangle } from 'lucide-react'

export default function MatchingScreen() {
  const navigate = useNavigate();
  const [connectionError, setConnectionError] = useState(false);
  const [acceptedTC, setAcceptedTC] = useState(false);

  useEffect(() => {
    if (!acceptedTC) return;

    // Determine user's selected mood
    const mood = sessionStorage.getItem('vent_mood') || 'unknown';

    // Connect to Socket server
    socket.connect();
    
    socket.on('connect_error', () => {
      setConnectionError(true);
    });

    // Slight delay to simulate finding connection for better UX (Netflix style feel)
    const timeout = setTimeout(() => {
       if(!connectionError) socket.emit('find_match', { mood });
    }, 1500);

    // Listen for match
    socket.on('match_found', (data) => {
      // data contains roomId
      sessionStorage.setItem('vent_room', data.roomId);
      if(data.partnerMood) sessionStorage.setItem('vent_partner_mood', data.partnerMood);
      navigate('/chat');
    });

    return () => {
      clearTimeout(timeout);
      socket.off('match_found');
      socket.off('connect_error');
      // DO NOT disconnect socket here unless they leave the site, pass it to chat page
    };
  }, [navigate, acceptedTC]);

  if (!acceptedTC) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-8 rounded-2xl border border-accent-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-600 to-indigo-600" />
          <h2 className="text-2xl font-bold text-white mb-4">Safety First 🛡️</h2>
          <div className="space-y-4 text-slate-300 text-sm text-left mb-8">
            <p className="flex gap-3"><span className="text-accent-400">1.</span> This is an anonymous platform. Do not share personal information.</p>
            <p className="flex gap-3"><span className="text-accent-400">2.</span> We are not responsible for any personal information shared.</p>
            <p className="flex gap-3"><span className="text-accent-400">3.</span> You can exit anytime if you feel uncomfortable or unsafe.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button 
              onClick={() => setAcceptedTC(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-bold transition shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 text-center">
      {connectionError ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertTriangle size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-slate-300">Connection Failed</h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">We couldn't reach the anonymous network. Please check your internet or try again later.</p>
          <button 
            onClick={() => { socket.disconnect(); navigate('/'); }} 
            className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-colors"
          >
            Return Home
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div 
            className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-accent-500 mb-8 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.h2 
            className="text-2xl font-semibold text-slate-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, yoyo: Infinity }}
          >
            Finding someone like you...
          </motion.h2>
          <p className="text-slate-500 mt-2">Connecting to anonymous network</p>
        </>
      )}
    </div>
  )
}
