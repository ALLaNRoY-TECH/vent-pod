import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const moods = [
  { id: 'low energy', label: 'Low Energy', emoji: '🪫', color: 'from-slate-700/40 to-slate-800/40', borderColor: 'hover:border-slate-500/50', shadow: 'hover:shadow-[0_0_20px_rgba(100,116,139,0.3)]' },
  { id: 'overthinking', label: 'Overthinking', emoji: '🌀', color: 'from-indigo-600/30 to-purple-800/30', borderColor: 'hover:border-purple-500/50', shadow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
  { id: 'just need someone', label: 'Just need someone', emoji: '🫂', color: 'from-blue-500/30 to-cyan-700/30', borderColor: 'hover:border-cyan-500/50', shadow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]' },
  { id: 'chaotic', label: 'Chaotic', emoji: '⚡', color: 'from-orange-500/30 to-red-600/30', borderColor: 'hover:border-red-500/50', shadow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' },
];

export default function MoodSelection() {
  const navigate = useNavigate();

  const handleSelect = (moodId) => {
    sessionStorage.setItem('vent_mood', moodId);
    navigate('/match');
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center flex-grow max-w-3xl mx-auto w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">How are you feeling right now?</h2>
        <p className="text-slate-400">Select a mood to find someone who understands.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full px-4">
        {moods.map((mood, index) => (
          <motion.div
            key={mood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(mood.id)}
            className={`cursor-pointer glass-card rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 border-transparent bg-gradient-to-br ${mood.color} ${mood.borderColor} ${mood.shadow} hover:-translate-y-1`}
          >
            <span className="text-6xl drop-shadow-md">{mood.emoji}</span>
            <span className="text-xl font-semibold tracking-wide">{mood.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
