import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, BookX, HeartCrack, Users } from 'lucide-react'

const moods = [
  { 
    id: 'mental_stress', 
    label: 'Mental Stress', 
    icon: BrainCircuit, 
    color: 'from-orange-500/20 to-red-600/20', 
    hoverColor: 'hover:from-orange-500/30 hover:to-red-600/30',
    borderColor: 'hover:border-red-500/50 border-transparent', 
    shadow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]',
    iconColor: 'text-red-400 group-hover:text-red-300'
  },
  { 
    id: 'academic_pressure', 
    label: 'Academic Pressure', 
    icon: BookX, 
    color: 'from-blue-600/20 to-indigo-800/20', 
    hoverColor: 'hover:from-blue-600/30 hover:to-indigo-800/30',
    borderColor: 'hover:border-indigo-500/50 border-transparent', 
    shadow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]',
    iconColor: 'text-indigo-400 group-hover:text-indigo-300'
  },
  { 
    id: 'relationship_issue', 
    label: 'Relationship Issue', 
    icon: HeartCrack, 
    color: 'from-pink-500/20 to-rose-700/20', 
    hoverColor: 'hover:from-pink-500/30 hover:to-rose-700/30',
    borderColor: 'hover:border-rose-500/50 border-transparent', 
    shadow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]',
    iconColor: 'text-rose-400 group-hover:text-rose-300'
  },
  { 
    id: 'just_need_someone', 
    label: 'Just need someone', 
    icon: Users, 
    color: 'from-teal-500/20 to-cyan-700/20', 
    hoverColor: 'hover:from-teal-500/30 hover:to-cyan-700/30',
    borderColor: 'hover:border-cyan-500/50 border-transparent', 
    shadow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]',
    iconColor: 'text-cyan-400 group-hover:text-cyan-300'
  },
];

export default function MoodSelection() {
  const navigate = useNavigate();

  const handleSelect = (moodId) => {
    sessionStorage.setItem('vent_mood', moodId);
    navigate('/match');
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center flex-grow max-w-4xl mx-auto w-full py-20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="text-center mb-16">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Safe Connection Setup
          </div>
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">How are you feeling right now?</h2>
        <p className="text-xl text-slate-400 font-light">Select a focus area so we can match you with someone who understands.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
        {moods.map((mood, index) => {
          const Icon = mood.icon;
          return (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.1), type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(mood.id)}
              className={`group cursor-pointer glass-card rounded-3xl p-10 flex flex-col items-center justify-center gap-6 transition-all duration-300 border bg-gradient-to-br ${mood.color} ${mood.hoverColor} ${mood.borderColor} ${mood.shadow}`}
            >
              <div className={`p-5 rounded-full bg-dark-900/50 backdrop-blur-sm border border-slate-700/50 group-hover:scale-110 transition-transform duration-300 ${mood.iconColor}`}>
                <Icon size={48} strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-bold tracking-wide text-slate-200 group-hover:text-white transition-colors">{mood.label}</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
