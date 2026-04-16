import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Shadcn / Custom Components
import Antigravity from '@/components/Antigravity';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  
  // Hero Refs
  const heroRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroBgRef = useRef(null);
  
  // Scrub Text Refs
  const scrubSectionRef = useRef(null);
  const scrubWordsRef = useRef([]);

  // Stacked Cards Refs
  const cardsSectionRef = useRef(null);
  const cardsRef = useRef([]);

  // Orb Refs
  const orbSectionRef = useRef(null);
  const orbRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Choose 3 Selection
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const featureOptions = [
    { id: 'chat', label: 'Anonymous Chat', icon: '💬' },
    { id: 'feed', label: 'Confession Feed', icon: '📝' },
    { id: 'music', label: 'Music Sharing', icon: '🎵' },
    { id: 'mod', label: 'AI Moderation', icon: '🛡️' }
  ];

  const toggleFeature = (id) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(prev => prev.filter(f => f !== id));
    } else if (selectedFeatures.length < 3) {
      setSelectedFeatures(prev => [...prev, id]);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Made slower/less aggressive as requested
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useGSAP(() => {
    const isMobile = window.innerWidth < 768;

    // --- Hero Parallax & Fade ---
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1.5, // Smoother scrub
      }
    });

    heroTl.to(heroTextRef.current, {
      y: isMobile ? 80 : 200, // Smoother zoom y vector
      scale: 0.95, // Softer zoom
      opacity: 0,
      ease: "power2.inOut" // Smoother fade
    }, 0);

    heroTl.to(heroBgRef.current, {
      y: isMobile ? 150 : 400,
      scale: 1.1,
      opacity: 0,
      ease: "none"
    }, 0);


    // --- Text Scrub Reveal ---
    if (scrubWordsRef.current.length > 0) {
      gsap.fromTo(scrubWordsRef.current, 
        { opacity: 0.1, y: 15, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          ease: "power2.out", // Smooth transition
          scrollTrigger: {
            trigger: scrubSectionRef.current,
            start: "top 75%",
            end: "bottom 65%",
            scrub: true,
          }
        }
      );
    }

    // --- Stacked Pinned Cards ---
    if (!isMobile && cardsRef.current.length > 0) {
      const cardsTl = gsap.timeline({
        scrollTrigger: {
          trigger: cardsSectionRef.current,
          start: "top top",
          end: `+=${cardsRef.current.length * 100}%`,
          pin: true,
          scrub: 1.2, // Slightly smoother scrubbing
        }
      });

      cardsRef.current.forEach((card, index) => {
        if (index === 0) return; // First card is already visible
        cardsTl.fromTo(card, 
          { y: window.innerHeight, scale: 0.85, opacity: 0 },
          { y: index * 45, scale: 1 - ((cardsRef.current.length - 1 - index) * 0.04), opacity: 1, duration: 1, ease: "power3.inOut" } // Smoother transitions
        , `+=${index * 0.25}`);
      });
    }

    // --- Emotional Orb & Overlay Background ---
    const orbTl = gsap.timeline({
      scrollTrigger: {
        trigger: orbSectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1.5,
      }
    });

    orbTl.fromTo(orbRef.current, 
      { scale: 0.6, opacity: 0, boxShadow: "0 0 0px rgba(6,182,212,0)" },
      { scale: 1.1, opacity: 0.9, boxShadow: "0 0 140px rgba(6,182,212,0.6)", ease: "power2.inOut" } // Made smoother
    ).to(orbRef.current, {
      scale: 1,
      opacity: 0.4,
      boxShadow: "0 0 60px rgba(6,182,212,0.3)"
    });

  }, { scope: mainRef });

  const scrubText = "A radically safe space to vent. Anonymous. Monitored. Real.".split(" ");
  const isSelectionComplete = selectedFeatures.length === 3;

  return (
    <div ref={mainRef} className="overflow-x-hidden w-full bg-[#040814] text-slate-100 selection:bg-cyan-500/30 font-sans">
      
      {/* SECTION 1: HERO PARALLAX WITH ANTIGRAVITY */}
      <section ref={heroRef} className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4 bg-gradient-to-b from-[#040814] to-[#0a1128]">
        
        {/* Abstract Antigravity Background */}
        <div ref={heroBgRef} className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden mix-blend-screen opacity-70 pointer-events-none">
          <div className="w-[1080px] h-[1080px] relative object-cover opacity-80" style={{ transform: 'scale(1.3)' }}>
            <Antigravity
              count={200}
              magnetRadius={8}
              ringRadius={4}
              waveSpeed={0.2}
              waveAmplitude={1.5}
              particleSize={0.9}
              lerpSpeed={0.08}
              color="#00f2fe" // Updated for sea-breeze vibe
              autoAnimate={true}
              particleVariance={1.2}
              rotationSpeed={0.1}
              depthFactor={1}
              pulseSpeed={2}
              particleShape="sphere"
              fieldStrength={8}
            />
          </div>
          {/* Gradients to blend out the edges */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#040814]/10 via-transparent to-[#040814] z-10" />
        </div>

        <div ref={heroTextRef} className="text-center max-w-5xl z-10 pt-20">
          <div className="inline-block mb-6 px-6 py-2 rounded-full border border-cyan-500/20 bg-cyan-900/10 backdrop-blur-md text-cyan-300 text-xs font-semibold uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            Anonymous Emotional Support
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.05] drop-shadow-2xl">
            You don't have to <br className="hidden md:block"/> go through it <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-teal-400 to-blue-500 drop-shadow-lg">alone.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300/80 mb-12 mx-auto max-w-2xl font-light leading-relaxed">
            Connect instantly with someone who understands. No judgment, no profiles, just real conversations when you need them most.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Pulse + glowing boundary on primary button */}
            <button 
              onClick={() => navigate('/mood')}
              className="relative px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold text-lg transition-all duration-500 transform hover:-translate-y-1 w-full sm:w-auto shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Start Venting</span>
            </button>
            <button 
              onClick={() => navigate('/help')}
              className="px-8 py-4 rounded-xl backdrop-blur-xl bg-white/5 text-cyan-100 hover:text-white hover:bg-white/10 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400 w-full sm:w-auto shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]"
            >
              Get Professional Help
            </button>
          </div>
        </div>

        {/* Scroll Indicator Down Arrow */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-60">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
             <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* SECTION 2: SCRUB TEXT REVEAL */}
      <section ref={scrubSectionRef} className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#040814] to-[#0a1128] py-32 px-6">
        <h2 className="text-4xl md:text-7xl font-bold max-w-6xl leading-tight text-center">
          {scrubText.map((word, i) => (
            <span 
              key={i} 
              ref={el => scrubWordsRef.current[i] = el}
              className="inline-block mr-3 md:mr-5 mb-2 will-change-transform text-teal-50 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)] opacity-10"
            >
              {word}
            </span>
          ))}
        </h2>
      </section>

      {/* SECTION 3: STACKED PINNED FEATURES */}
      <section ref={cardsSectionRef} className="h-screen w-full relative overflow-hidden bg-[#0a1128] flex items-center justify-center border-y border-teal-900/30">
        
        {/* Background sea breeze glow for cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative w-full max-w-4xl mx-auto px-4 h-[600px] my-auto perspective-1000">
          
          {/* Card 1 */}
          <div ref={el => cardsRef.current[0] = el} className="absolute top-10 left-0 w-full backdrop-blur-2xl bg-[#0a1930]/60 rounded-3xl p-10 md:p-14 border border-cyan-800/50 hover:border-cyan-400 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col md:flex-row items-center gap-10 origin-top transform-gpu hover:-translate-y-2">
            <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex flex-shrink-0 items-center justify-center text-4xl shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-500/20">💬</div>
            <div>
              <h3 className="text-3xl font-bold mb-4 text-cyan-50">Anonymous Chat</h3>
              <p className="text-xl text-teal-100/70 leading-relaxed text-balance">Match based solely on your emotional state. Zero profile pictures, zero tracking, just an instant connection with someone who is ready to listen.</p>
              <button className="mt-8 text-cyan-400 font-semibold hover:text-cyan-300 text-lg group flex items-center gap-2 transition-colors">Try it out <span className="inline-block group-hover:translate-x-1 transition-transform">→</span></button>
            </div>
          </div>

          {/* Card 2 */}
          <div ref={el => cardsRef.current[1] = el} className="absolute top-10 left-0 w-full backdrop-blur-2xl bg-[#0b1c36]/70 rounded-3xl p-10 md:p-14 border border-teal-800/50 hover:border-teal-400 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_50px_rgba(20,184,166,0.2)] flex flex-col md:flex-row items-center gap-10 origin-top z-10 transform-gpu hover:-translate-y-2">
            <div className="w-24 h-24 rounded-full bg-teal-500/10 flex flex-shrink-0 items-center justify-center text-4xl shadow-[0_0_30px_rgba(20,184,166,0.3)] border border-teal-500/20">📝</div>
            <div>
              <h3 className="text-3xl font-bold mb-4 text-teal-50">Confession Feed</h3>
              <p className="text-xl text-teal-100/70 leading-relaxed text-balance">Send your rawest thoughts into the void. Read, react, and reply to others without fear of judgment. It's a collective diary for the mind.</p>
              <button className="mt-8 text-teal-400 font-semibold hover:text-teal-300 text-lg group flex items-center gap-2 transition-colors" onClick={() => navigate('/feed')}>Go to Feed <span className="inline-block group-hover:translate-x-1 transition-transform">→</span></button>
            </div>
          </div>

          {/* Card 3 */}
          <div ref={el => cardsRef.current[2] = el} className="absolute top-10 left-0 w-full backdrop-blur-2xl bg-[#08152e]/80 rounded-3xl p-10 md:p-14 border border-blue-800/50 hover:border-blue-400 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.7)] hover:shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col md:flex-row items-center gap-10 origin-top z-20 transform-gpu hover:-translate-y-2">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex flex-shrink-0 items-center justify-center text-4xl shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-500/20">🛡️</div>
            <div>
              <h3 className="text-3xl font-bold mb-4 text-blue-50">AI Moderation</h3>
              <p className="text-xl text-blue-100/70 leading-relaxed text-balance">Real-time intelligent interception of toxic messages. Our platform enforces strict guidelines to ensure every conversation remains helpful and supportive.</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* SECTION 4: EMOTIONAL ORB / CHOOSE 3 OVERLAY / CTA */}
      <section ref={orbSectionRef} className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-b from-[#0a1128] to-[#040814] border-t border-teal-900/20 py-20">
        
        {/* The Orb Background (Pulsing and subtle mouse follow) */}
        <div 
          ref={orbRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-tr from-[#00f2fe] via-[#4facfe] to-[#1e3c72] blur-[80px] pointer-events-none mix-blend-screen opacity-40 animate-[pulse_4s_ease-in-out_infinite]"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 5}px), calc(-50% + ${mousePos.y * 5}px)) rotate(${mousePos.x * 5}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
        />

        <div className="relative z-10 w-full max-w-3xl px-4 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-cyan-50 drop-shadow-2xl">
            Design Your Space
          </h2>
          <p className="text-teal-200/80 mb-10 text-lg md:text-xl text-center">
            Select up to 3 core features to activate your gateway.
          </p>

          <div className="w-full flex justify-between items-center mb-6 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-sm font-medium tracking-wide uppercase text-cyan-300">Feature Lock</span>
            <span className={`text-sm font-bold tracking-widest transition-colors duration-300 ${isSelectionComplete ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'text-slate-400'}`}>
              {selectedFeatures.length} / 3 Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12">
            {featureOptions.map(f => {
              const isSelected = selectedFeatures.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFeature(f.id)}
                  className={`relative p-6 rounded-2xl text-left border overflow-hidden backdrop-blur-xl transition-all duration-300 transform-gpu hover:-translate-y-1 flex items-center gap-4 ${
                    isSelected 
                    ? 'border-cyan-400 bg-cyan-900/30 shadow-[0_0_25px_rgba(6,182,212,0.4)]' 
                    : 'border-slate-700/50 bg-[#0a1930]/50 hover:bg-[#0a1930]/80 hover:border-teal-500/40'
                  }`}
                >
                  {/* Subtle inner glow on select */}
                  {isSelected && <div className="absolute inset-0 bg-cyan-400/10 blur-xl pointer-events-none" />}
                  
                  <div className={`text-3xl transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]' : ''}`}>
                    {f.icon}
                  </div>
                  <span className={`text-lg font-semibold transition-colors duration-300 ${isSelected ? 'text-white drop-shadow-md' : 'text-slate-300'}`}>
                    {f.label}
                  </span>
                  
                  {/* Selection dot */}
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 transition-all duration-300 ${isSelected ? 'border-cyan-400 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'border-slate-600 bg-transparent'}`} />
                </button>
              )
            })}
          </div>

          <div className="flex flex-col items-center">
            <button 
              onClick={() => isSelectionComplete && navigate('/mood')}
              disabled={!isSelectionComplete}
              className={`px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group ${
                isSelectionComplete 
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-dark-900 transform hover:-translate-y-1 shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:shadow-[0_0_60px_rgba(6,182,212,0.9)] cursor-pointer' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isSelectionComplete && <div className="absolute inset-0 w-full h-full bg-white/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></div>}
              <span className="relative z-10">{isSelectionComplete ? 'Start Your Session' : 'Locked'}</span>
              
              {isSelectionComplete && (
                <svg className="w-6 h-6 animate-pulse relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
            {!isSelectionComplete && (
              <p className="mt-4 text-slate-500/80 text-sm font-light">Select options to unlock your gateway.</p>
            )}
          </div>

        </div>
      </section>

      <footer className="h-[15vh] w-full bg-[#03060f] flex items-center justify-center border-t border-teal-900/30">
        <p className="text-teal-900 hover:text-teal-600 transition-colors cursor-default font-medium tracking-wide text-sm">VentPod © 2026. Designed for real connection.</p>
      </footer>
    </div>
  );
}
