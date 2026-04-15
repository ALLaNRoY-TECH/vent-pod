import { motion } from 'framer-motion'

export default function IntroScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Background glow sweep */}
      <motion.div
        initial={{ left: "-100%" }}
        animate={{ left: "200%" }}
        transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-accent-600/30 to-transparent skew-x-12 blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tighter text-white"
          initial={{ textShadow: "0px 0px 0px rgba(139, 92, 246, 0)" }}
          animate={{ textShadow: "0px 0px 40px rgba(139, 92, 246, 0.8)" }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          VENT<span className="text-accent-500">POD</span>
        </motion.h1>
      </motion.div>
    </motion.div>
  )
}
