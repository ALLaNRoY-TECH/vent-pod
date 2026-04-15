import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { socket } from '../utils/socket'
import { Send, AlertTriangle, LogOut, Info, ShieldCheck } from 'lucide-react'

export default function ChatPage() {
  const navigate = useNavigate();
  const roomId = sessionStorage.getItem('vent_room');
  const partnerMood = sessionStorage.getItem('vent_partner_mood');
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  
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

    socket.on('message_warning', (data) => {
      setMessages(prev => {
        const arr = [...prev];
        for (let i = arr.length - 1; i >= 0; i--) {
          if (arr[i].sender === socket.id && arr[i].status === 'optimistic') {
            arr.splice(i, 1);
            break;
          }
        }
        return arr;
      });
      setWarningMessage(data.message);
      setTimeout(() => setWarningMessage(null), 5000);
    });

    socket.on('critical_alert', () => {
      setMessages(prev => {
        const arr = [...prev];
        for (let i = arr.length - 1; i >= 0; i--) {
          if (arr[i].sender === socket.id && arr[i].status === 'optimistic') {
            arr.splice(i, 1);
            break;
          }
        }
        return arr;
      });
      setShowCriticalAlert(true);
    });

    socket.on('message_ack', (data) => {
      setMessages(prev => {
        const arr = [...prev];
        for (let i = arr.length - 1; i >= 0; i--) {
          if (arr[i].sender === socket.id && arr[i].status === 'optimistic' && arr[i].content === data.content) {
            arr[i].status = 'sent';
            break;
          }
        }
        return arr;
      });
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing_status');
      socket.off('partner_left');
      socket.off('message_warning');
      socket.off('critical_alert');
      socket.off('message_ack');
    };
  }, [navigate, roomId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || partnerLeft) return;

    // Optimistic UI: Add instantly to local state
    const optMsg = { sender: socket.id, content: inputText, status: 'optimistic' };
    setMessages(prev => [...prev, optMsg]);

    socket.emit('send_message', { roomId, message: inputText });
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
    navigate('/');
  };

  const predefinedReplies = ["I'm listening.", "That sounds really tough.", "You'll get through this.", "I understand."];

  const handleSuggestReply = (reply) => {
    socket.emit('send_message', { roomId, message: reply });
  };

  return (
    <motion.div 
      className="flex flex-col h-[85vh] max-w-4xl mx-auto w-full glass-card rounded-2xl overflow-hidden shadow-2xl relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
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
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
            title="Leave Chat"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {/* Connection text */}
        <div className="text-center text-xs text-slate-500 my-4">
           You have connected to a stranger. Say hi anonymously.
        </div>

        <AnimatePresence>
          {warningMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center my-2"
            >
              <span className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs px-4 py-2 rounded-full">
                <AlertTriangle size={14} /> {warningMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, i) => {
          const isMe = msg.sender === socket.id;
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
                } ${msg.status === 'optimistic' ? 'opacity-70' : 'opacity-100'}`}
              >
                {msg.content}
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
            Stranger has disconnected. <button onClick={handleLeave} className="underline hover:text-white">Leave chat</button>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark-900 border-t border-slate-700/50">
        {!partnerLeft && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
            {predefinedReplies.map((reply, i) => (
              <button 
                key={i}
                onClick={() => handleSuggestReply(reply)}
                className="whitespace-nowrap px-3 py-1.5 text-xs rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={handleTyping}
            disabled={partnerLeft}
            placeholder={partnerLeft ? "Chat closed..." : "Type a message..."}
            className="flex-grow bg-dark-800 border border-slate-700 rounded-xl px-4 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all text-white placeholder-slate-500"
          />
          <button 
            type="submit"
            disabled={partnerLeft || !inputText.trim()}
            className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
          >
            <Send size={20} className={inputText.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>

      {/* Critical Emergency Popup */}
      <AnimatePresence>
        {showCriticalAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-dark-900/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-dark-800 border border-slate-700 shadow-2xl max-w-sm w-full p-8 text-center rounded-2xl relative">
              <h2 className="text-2xl font-bold text-red-400 mb-2">Notice</h2>
              <p className="text-slate-200 mb-6 font-medium">You are not alone. Please consider reaching out for help.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/help')}
                  className="bg-accent-600 hover:bg-accent-500 text-white py-3 rounded-xl font-bold shadow-glow transition w-full"
                >
                  Get Professional Help
                </button>
                <button 
                  onClick={() => setShowCriticalAlert(false)}
                  className="text-slate-400 hover:text-white text-sm mt-3"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
