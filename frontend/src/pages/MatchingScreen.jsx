import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { socket } from '../utils/socket'
import { AlertTriangle } from 'lucide-react'

export default function MatchingScreen() {
  const navigate = useNavigate();
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
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
  }, [navigate]);

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
