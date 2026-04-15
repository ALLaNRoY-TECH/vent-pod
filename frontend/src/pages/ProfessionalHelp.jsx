import { motion } from 'framer-motion'
import { Star, Clock, Video, MessageCircle } from 'lucide-react'

const therapists = [
  { id: 1, name: "Dr. Sarah Jenkins", title: "Clinical Psychologist", rating: 4.9, exp: "12 yrs", img: "SJ", available: true },
  { id: 2, name: "Mark Peterson", title: "Licensed Counselor", rating: 4.8, exp: "8 yrs", img: "MP", available: true },
  { id: 3, name: "Dr. Emily Chen", title: "Anxiety Specialist", rating: 5.0, exp: "15 yrs", img: "EC", available: false },
]

export default function ProfessionalHelp() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto w-full py-8"
    >
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold mb-4">Professional Help</h1>
        <p className="text-slate-400 max-w-2xl">If you are feeling overwhelmed, speaking to a licensed professional can help. Book a session or talk right now securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {therapists.map(t => (
          <motion.div 
            key={t.id}
            whileHover={{ y: -5 }}
            className="glass-card rounded-2xl p-6 relative overflow-hidden"
          >
            {t.available && (
              <span className="absolute top-4 right-4 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent-600 to-indigo-600 flex items-center justify-center text-xl font-bold mb-4">
              {t.img}
            </div>
            <h3 className="text-lg font-bold">{t.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{t.title}</p>
            
            <div className="flex gap-4 text-xs text-slate-300 mb-6">
               <div className="flex items-center gap-1"><Star size={14} className="text-yellow-400"/> {t.rating}</div>
               <div className="flex items-center gap-1"><Clock size={14} /> {t.exp} exp</div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                <Video size={16} /> Book
              </button>
              <button disabled={!t.available} className="flex-1 bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:bg-slate-700 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Talk Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Helpline banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-xl font-bold text-red-400 mb-2">Emergency Hotline</h4>
          <p className="text-slate-300 text-sm">If you are in immediate danger or experiencing a crisis, please call your local emergency services.</p>
        </div>
        <button className="whitespace-nowrap px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition">
          View Hotlines
        </button>
      </div>
    </motion.div>
  )
}
