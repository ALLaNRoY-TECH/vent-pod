import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeartPulse } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative text-slate-100">
      {/* Global Background */}
      <div className="fixed inset-0 bg-dark-900 -z-20" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-500/10 via-dark-900/80 to-dark-900 -z-10" />

      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 p-6 z-40 bg-dark-900/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <HeartPulse className="w-6 h-6 text-accent-500 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight">Vent<span className="text-accent-500">Pod</span></span>
          </Link>

        </div>
      </nav>

      <main className="flex-grow pt-24 pb-12 px-6 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
