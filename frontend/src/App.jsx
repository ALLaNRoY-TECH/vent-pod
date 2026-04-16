import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import MoodSelection from './pages/MoodSelection'
import MatchingScreen from './pages/MatchingScreen'
import ChatPage from './pages/ChatPage'
import ProfessionalHelp from './pages/ProfessionalHelp'
import ConfessionFeed from './pages/ConfessionFeed'
import IntroScreen from './components/IntroScreen'

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Show intro for 2.5 seconds on first load
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroScreen key="intro" />}
      </AnimatePresence>

      <div className={showIntro ? 'h-screen overflow-hidden' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="mood" element={<MoodSelection />} />
              <Route path="match" element={<MatchingScreen />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="feed" element={<ConfessionFeed />} />
              <Route path="help" element={<ProfessionalHelp />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
    </>
  )
}

export default App
