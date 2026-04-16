import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { socket } from '../utils/socket'
import { Send, AlertTriangle, LogOut, Info, ShieldCheck, Lock } from 'lucide-react'

export default function ChatPage() {
  const navigate = useNavigate();
  const roomId = sessionStorage.getItem('vent_room');
  const partnerMood = sessionStorage.getItem('vent_partner_mood');
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [warningToast, setWarningToast] = useState(null);
  const [finalWarning, setFinalWarning] = useState(null);
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [partnerBanned, setPartnerBanned] = useState(false);
  const [deescalateSuggestion, setDeescalateSuggestion] = useState(null);
  const [memoryKeywords, setMemoryKeywords] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  useEffect(() => { scrollToBottom() }, [messages, partnerTyping]);

  useEffect(() => {
    if (!roomId || !socket.connected) {
      navigate('/');
      return;
    }

    // Socket listeners
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
      setPartnerTyping(false);
    });

    socket.on('typing_status', (data) => {
      setPartnerTyping(data.isTyping);
    });

    socket.on('partner_left', () => {
      setPartnerLeft(true);
      setPartnerTyping(false);
    });

    socket.on('partner_banned', () => {
      setPartnerBanned(true);
      setPartnerLeft(true);
      setPartnerTyping(false);
    });

    socket.on('banned', (data) => {
      setIsBanned(true);
    });

    socket.on('warning', (data) => {
      setWarningCount(data.count);
      setWarningToast({ message: data.message, count: data.count });
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      setTimeout(() => setWarningToast(null), 5000);
    });

    socket.on('final_warning', (data) => {
      setWarningCount(2);
      setFinalWarning(data.message);
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      setTimeout(() => setFinalWarning(null), 5000);
    });

    socket.on('critical_alert', (data) => {
      setShowCriticalAlert(true);
      if(data && data.count) setWarningCount(data.count);
    });

    socket.on('deescalate_suggestion', (data) => {
      setDeescalateSuggestion(data.suggestion);
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
    });

    socket.on('session_ended', (data) => {
      setPartnerLeft(true);
      setMessages(prev => [...prev, { system: true, content: data.message }]);
      socket.disconnect();
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing_status');
      socket.off('partner_left');
      socket.off('message_warning'); // Keep for safety if backend reverts
      socket.off('warning');
      socket.off('final_warning');
      socket.off('critical_alert');
      socket.off('message_ack');
      socket.off('banned');
      socket.off('partner_banned');
    };
  }, [navigate, roomId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || partnerLeft) return;

    // Detect anonymous memory triggers
    const lower = inputText.toLowerCase();
    if (lower.includes('stress') && !memoryKeywords.has('stress')) {
      setMemoryKeywords(prev => new Set(prev).add('stress'));
      setTimeout(() => {
        setMessages(prev => [...prev, { system: true, content: "Earlier you mentioned feeling stressed. We're here to listen." }]);
      }, 3000);
    } else if (lower.includes('lonely') && !memoryKeywords.has('lonely')) {
      setMemoryKeywords(prev => new Set(prev).add('lonely'));
      setTimeout(() => {
        setMessages(prev => [...prev, { system: true, content: "Earlier you mentioned feeling lonely. It's brave of you to share." }]);
      }, 3000);
    } else if (lower.includes('exam') && !memoryKeywords.has('exam')) {
      setMemoryKeywords(prev => new Set(prev).add('exam'));
      setTimeout(() => {
        setMessages(prev => [...prev, { system: true, content: "Exams can be overwhelming. Take it one step at a time." }]);
      }, 3000);
    }


    // Direct emit matching strict backend schema
    socket.emit('send_message', { text: inputText, room: roomId });
    socket.emit('typing', { roomId, isTyping: false });
    setInputText('');
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);

    // Typing indication logic
    if(!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { roomId, isTyping: true });
    }

    if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { roomId, isTyping: false });
    }, 2000);
  };

  const handleLeave = () => {
    socket.emit('leave_chat', { roomId });
    socket.disconnect();
    sessionStorage.removeItem('vent_room');
    alert("You are safe. You left the chat.");
    navigate('/');
  };

  const predefinedReplies = ["I'm listening.", "That sounds really tough.", "You'll get through this.", "I understand."];

  const handleSuggestReply = (reply) => {
    socket.emit('send_message', { text: reply, room: roomId });
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const spotifyMatch = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) return `https://open.spotify.com/embed/track/${spotifyMatch[1]}?utm_source=generator&theme=0`;
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return null;
  };

  return (
    <motion.div 
      className="flex flex-col h-[85vh] max-w-4xl mx-auto w-full glass-card rounded-2xl overflow-hidden shadow-2xl relative"
      initial={{ opacity: 0, y: 30 }}
      animate={shakeInput ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, duration: 0.4 }}
    >
      {/* AI Banner */}
      <div className="bg-accent-600/20 text-accent-300 text-xs py-1.5 text-center flex items-center justify-center gap-2">
        <ShieldCheck size={14} /> AI is monitoring this chat for safety
      </div>

      {/* Header */}
      <div className="bg-dark-800/80 backdrop-blur-md p-4 border-b border-slate-700/50 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-gradient-to-tr from-accent-500 to-indigo-500 opacity-50" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Stranger</h3>
            <p className="text-xs text-slate-400 capitalize">
              {partnerLeft ? <span className="text-red-400">Disconnected</span> : partnerTyping ? "Typing..." : "Online"}
            </p>
          </div>
          {partnerMood && (
            <div className="hidden sm:flex items-center gap-1 ml-4 px-3 py-1 rounded-full bg-dark-900/50 border border-white/5 text-xs text-slate-400">
               <Info size={12} className="text-accent-400"/>
               Feeling: <span className="text-accent-300 font-medium">{partnerMood}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
               socket.emit('report_user', { reportedUser: 'partner', reason: 'Inappropriate behavior' });
               handleLeave();
            }}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
            title="Report User"
          >
            <AlertTriangle size={20} />
          </button>
          <button 
            onClick={handleLeave}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer text-sm font-bold border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
            title="Emergency Exit"
          >
            <LogOut size={16} /> Exit Chat
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {/* Connection text */}
        <div className="text-center text-xs text-slate-500 my-4">
           You have connected to a stranger. Say hi anonymously.
        </div>



        {messages.map((msg, i) => {
          if (msg.system) {
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex justify-center my-3"
              >
                 <div className="bg-dark-700/60 text-slate-400 text-[11px] italic px-4 py-1.5 rounded-full border border-slate-600/30 font-medium tracking-wide">
                    {msg.content || msg.text || msg.message}
                 </div>
              </motion.div>
            )
          }

          const isMe = msg.sender === socket.id;
          const msgText = msg.text || msg.content || msg.message;
          const embedUrl = getEmbedUrl(msgText);
          
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl transition-opacity duration-300 ${
                  isMe 
                    ? 'bg-accent-600 text-white rounded-tr-none' 
                    : 'bg-dark-700/80 text-slate-200 rounded-tl-none border border-slate-600/30'
                } opacity-100 flex flex-col gap-2 overflow-hidden break-words`}
              >
                <span>{msgText}</span>
                {embedUrl && (
                  <iframe 
                    src={embedUrl} 
                    className="w-full h-20 rounded-lg border border-white/10"
                    frameBorder="0" 
                    allow="encrypted-media" 
                    title="Embedded Content"
                  />
                )}
              </div>
            </motion.div>
          )
        })}

        {partnerTyping && (
           <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex justify-start"
           >
              <div className="bg-dark-700/50 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
           </motion.div>
        )}

        {partnerLeft && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-400/80 text-sm py-4">
            {partnerBanned ? "Your chat partner has been removed due to safety violations." : "Stranger has disconnected."} <button onClick={handleLeave} className="underline hover:text-white">Leave chat</button>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark-900 border-t border-slate-700/50 relative">
        <AnimatePresence>
          {deescalateSuggestion && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-4 right-4 z-40 bg-dark-800 border border-slate-600 shadow-2xl rounded-xl p-4 mb-2"
            >
              <p className="text-slate-300 text-sm mb-2 font-semibold flex items-center gap-2"><AlertTriangle size={16} className="text-orange-400" /> Try rephrasing this:</p>
              <div className="bg-dark-900 border border-slate-700 rounded-lg p-3 text-slate-200 mb-4 text-sm">
                "{deescalateSuggestion}"
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeescalateSuggestion(null)}
                  className="w-1/3 py-2 px-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition font-medium"
                >
                  Ignore
                </button>
                <button 
                  onClick={() => {
                    socket.emit('send_message', { text: deescalateSuggestion, room: roomId });
                    setDeescalateSuggestion(null);
                  }}
                  className="w-2/3 py-2 px-4 rounded-xl bg-accent-600 hover:bg-accent-500 text-white transition font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  Send this instead
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!partnerLeft && (
          <div className="flex justify-between items-center mb-3">
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
               {predefinedReplies.map((reply, i) => (
                 <button key={i} onClick={() => handleSuggestReply(reply)} className="whitespace-nowrap px-3 py-1.5 text-xs rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700 transition">
                   {reply}
                 </button>
               ))}
             </div>
             {warningCount > 0 && (
               <span className="text-xs text-orange-400 font-semibold px-2 py-1 rounded bg-orange-400/10">Warnings: {warningCount}/3</span>
             )}
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <motion.input 
            type="text"
            value={inputText}
            onChange={handleTyping}
            disabled={partnerLeft || isBanned}
            placeholder={isBanned ? "You are banned from sending messages" : partnerLeft ? "Chat closed..." : "Type a message..."}
            className="flex-grow bg-dark-800 border border-slate-700 rounded-xl px-4 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all text-white placeholder-slate-500"
            animate={shakeInput ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
          />
          <motion.button 
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={partnerLeft || isBanned || !inputText.trim()}
            className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center relative overflow-hidden"
          >
            <Send size={20} className={inputText.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </motion.button>
        </form>
      </div>

      {/* Toast Warning (Top Right) */}
      <AnimatePresence>
        {warningToast && !finalWarning && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="absolute top-4 right-4 z-50 glass-card px-4 py-3 rounded-xl border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-start gap-3 max-w-sm"
          >
            <AlertTriangle className="text-orange-500 shrink-0" size={20}/>
            <div>
              <p className="font-bold text-orange-400 text-sm tracking-wide mb-1">⚠️ Warning {warningToast.count}/3</p>
              <p className="text-slate-300 text-xs">{warningToast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Warning Toast (Top Right) */}
      <AnimatePresence>
        {finalWarning && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0, rotate: [-1, 1, -1, 1, 0] }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="absolute top-4 right-4 z-50 glass-card px-4 py-3 rounded-xl bg-gradient-to-r from-orange-600/80 to-red-600/80 border border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-start gap-3 max-w-sm"
          >
            <AlertTriangle className="text-white shrink-0" size={20}/>
            <div>
              <p className="font-bold text-white text-sm tracking-wide mb-1">⚠️ Final Warning</p>
              <p className="text-red-100 text-xs">{finalWarning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Critical Emergency Popup */}
      <AnimatePresence>
        {showCriticalAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-dark-900/90 backdrop-blur-md flex items-center justify-center p-4 transition-all"
          >
            <div className="bg-dark-800 border border-slate-700 shadow-[0_0_50px_rgba(139,92,246,0.3)] max-w-sm w-full p-8 text-center rounded-2xl relative">
              <h2 className="text-2xl font-bold text-red-400 mb-2">Notice</h2>
              <p className="text-slate-200 mb-6 font-medium">You are not alone. Please consider seeking support.</p>
              
              <div className="flex flex-col gap-3">
                <motion.button 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={() => navigate('/help')}
                  className="bg-accent-600 hover:bg-accent-500 text-white py-3 rounded-xl font-bold shadow-glow transition w-full"
                >
                  Get Professional Help
                </motion.button>
                <button 
                  onClick={() => setShowCriticalAlert(false)}
                  className="bg-dark-700 hover:bg-dark-600 border border-slate-600 text-white py-3 rounded-xl font-bold transition w-full"
                >
                  Continue Safely
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banned Screen Followover */}
      <AnimatePresence>
        {isBanned && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[60] bg-gradient-to-b from-red-900 via-dark-900 to-black backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full flex flex-col items-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                 <Lock size={40} className="text-red-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-4">Account Restricted</h1>
              <p className="text-slate-300 mb-8 text-lg">You have been banned from chat due to repeated safety violations.</p>
              
              <button 
                onClick={() => navigate('/')}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition w-full uppercase tracking-widest"
              >
                Return Home
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
