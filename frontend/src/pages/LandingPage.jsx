import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto text-center"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -20 }}
      variants={{
        visible: { transition: { staggerChildren: 0.3 } }
      }}
    >
      <motion.div variants={fadeIn} className="inline-block mb-4 px-4 py-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 text-accent-400 text-xs font-semibold uppercase tracking-wider">
        Anonymous Emotional Support
      </motion.div>
      
      <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
        You don't have to <br className="hidden md:block"/> go through it <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">alone.</span>
      </motion.h1>
      
      <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl">
        Connect instantly with someone who understands. No judgment, no profiles, just real conversations when you need them most.
      </motion.p>
      
      <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/mood')}
          className="px-8 py-4 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-semibold text-lg shadow-glow hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] transition-all duration-300 transform hover:-translate-y-1"
        >
          Start Venting
        </button>
        <button 
          onClick={() => navigate('/help')}
          className="px-8 py-4 rounded-xl glass-card text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          Get Professional Help
        </button>
      </motion.div>

      {/* Floating particles background effect can be achieved via subtle animated divs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-600/10 rounded-full blur-3xl -z-10"
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10"
        animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  )
}
