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
        scrub: 1.5,
      }
    });

    heroTl.to(heroTextRef.current, {
      y: isMobile ? 80 : 200,
      scale: 0.95,
      opacity: 0,
      ease: "power2.inOut"
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
          scrub: 1.2,
        }
      });

      cardsRef.current.forEach((card, index) => {
        if (index === 0) return; // First card is already visible
        cardsTl.fromTo(card, 
          { y: window.innerHeight, scale: 0.85, opacity: 0 },
          { y: index * 45, scale: 1 - ((cardsRef.current.length - 1 - index) * 0.04), opacity: 1, duration: 1, ease: "power3.inOut" }
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
      { scale: 0.6, opacity: 0, boxShadow: "0 0 0px rgba(234,179,8,0)" },
      { scale: 1.1, opacity: 0.9, boxShadow: "0 0 140px rgba(234,179,8,0.5)", ease: "power2.inOut" } 
    ).to(orbRef.current, {
      scale: 1,
      opacity: 0.4,
      boxShadow: "0 0 60px rgba(234,179,8,0.2)"
    });

  }, { scope: mainRef });

  const scrubText = "A radically safe space to vent. Anonymous. Monitored. Real.".split(" ");

  return (
    <div ref={mainRef} className="overflow-x-hidden w-full bg-[#050505] text-slate-100 selection:bg-yellow-500/30 font-sans">
      
      {/* SECTION 1: HERO PARALLAX WITH ANTIGRAVITY */}
      <section ref={heroRef} className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4 bg-gradient-to-b from-[#050505] to-[#0a0a0a]">
        
        {/* Abstract Antigravity Background */}
        <div ref={heroBgRef} className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden mix-blend-screen opacity-70 pointer-events-none">
          <div className="w-[1080px] h-[1080px] relative object-cover opacity-80" style={{ transform: 'scale(1.3)' }}>
            <Antigravity
              count={180}
              magnetRadius={8}
              ringRadius={6}
              waveSpeed={0.2}
              waveAmplitude={1.2}
              particleSize={1.1}
              lerpSpeed={0.08}
              color="#eab308" // Premium yellow-500
              autoAnimate={true}
              particleVariance={1.5}
              rotationSpeed={0.1}
              depthFactor={1}
              pulseSpeed={2}
              particleShape="sphere"
              fieldStrength={8}
            />
          </div>
          {/* Gradients to blend out the edges */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-transparent to-[#050505] z-10" />
        </div>

        <div ref={heroTextRef} className="text-center max-w-5xl z-10 pt-20">
          <div className="inline-block mb-6 px-6 py-2 rounded-full border border-yellow-500/20 bg-yellow-900/10 backdrop-blur-md text-yellow-500 text-xs font-semibold uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(234,179,8,0.15)]">
            Premium Anonymous Support
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.05] drop-shadow-2xl text-white">
            You don't have to <br className="hidden md:block"/> go through it <span className="text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 drop-shadow-lg">alone.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 mx-auto max-w-2xl font-light leading-relaxed">
            Connect instantly with someone who understands. No judgment, no profiles, just real conversations when you need them most.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Pulse + glowing boundary on primary button */}
            <button 
              onClick={() => navigate('/mood')}
              className="relative px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-extrabold text-lg transition-all duration-500 transform hover:-translate-y-1 w-full sm:w-auto shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] overflow-hidden group border border-yellow-400/50"
            >
              <div className="absolute inset-0 w-full h-full bg-white/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Start Venting</span>
            </button>
            <button 
              onClick={() => navigate('/help')}
              className="px-8 py-4 rounded-xl backdrop-blur-xl bg-white/5 text-zinc-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-300 border border-zinc-700/50 hover:border-yellow-500/50 w-full sm:w-auto shadow-lg"
            >
              Get Professional Help
            </button>
          </div>
        </div>

        {/* Scroll Indicator Down Arrow */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-60">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500">
             <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* SECTION 2: SCRUB TEXT REVEAL */}
      <section ref={scrubSectionRef} className="min-h-screen w-full flex items-center justify-center bg-[#050505] py-32 px-6">
        <h2 className="text-4xl md:text-7xl font-bold max-w-6xl leading-tight text-center">
          {scrubText.map((word, i) => (
            <span 
              key={i} 
              ref={el => scrubWordsRef.current[i] = el}
              className="inline-block mr-3 md:mr-5 mb-2 will-change-transform text-white opacity-10"
            >
              {word}
            </span>
          ))}
        </h2>
      </section>

      {/* SECTION 3: STACKED PINNED FEATURES */}
      <section ref={cardsSectionRef} className="h-screen w-full relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center border-y border-zinc-900">
        
        {/* Background glow for cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative w-full max-w-4xl mx-auto px-4 h-[600px] my-auto perspective-1000">
          
          {/* Card 1 */}
          <div ref={el => cardsRef.current[0] = el} className="absolute top-10 left-0 w-full backdrop-blur-2xl bg-[#111111]/80 rounded-3xl p-10 md:p-14 border border-zinc-800 hover:border-yellow-500/50 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_40px_rgba(234,179,8,0.15)] flex flex-col md:flex-row items-center gap-10 origin-top transform-gpu hover:-translate-y-2">
            <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex flex-shrink-0 items-center justify-center text-4xl shadow-[0_0_20px_rgba(234,179,8,0.2)] border border-yellow-500/20 text-yellow-500">💬</div>
            <div>
              <h3 className="text-3xl font-bold mb-4 text-white">Anonymous Chat</h3>
              <p className="text-xl text-zinc-400 leading-relaxed text-balance">Match based solely on your emotional state. Zero profile pictures, zero tracking, just an instant connection with someone who is ready to listen.</p>
              <button className="mt-8 text-yellow-500 font-bold hover:text-yellow-400 text-lg group flex items-center gap-2 transition-colors">Try it out <span className="inline-block group-hover:translate-x-1 transition-transform">→</span></button>
            </div>
          </div>

          {/* Card 2 */}
          <div ref={el => cardsRef.current[1] = el} className="absolute top-10 left-0 w-full backdrop-blur-2xl bg-[#141414]/90 rounded-3xl p-10 md:p-14 border border-zinc-800 hover:border-amber-500/50 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.9)] hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-center gap-10 origin-top z-10 transform-gpu hover:-translate-y-2">
            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex flex-shrink-0 items-center justify-center text-4xl shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/20 text-amber-500">📝</div>
            <div>
              <h3 className="text-3xl font-bold mb-4 text-white">Confession Feed</h3>
              <p className="text-xl text-zinc-400 leading-relaxed text-balance">Send your rawest thoughts into the void. Read, react, and reply to others without fear of judgment. It's a collective diary for the mind.</p>
              <button className="mt-8 text-amber-500 font-bold hover:text-amber-400 text-lg group flex items-center gap-2 transition-colors" onClick={() => navigate('/feed')}>Go to Feed <span className="inline-block group-hover:translate-x-1 transition-transform">→</span></button>
            </div>
          </div>

          {/* Card 3 */}
          <div ref={el => cardsRef.current[2] = el} className="absolute top-10 left-0 w-full backdrop-blur-2xl bg-[#181818]/95 rounded-3xl p-10 md:p-14 border border-zinc-800 hover:border-yellow-400/50 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.95)] hover:shadow-[0_0_50px_rgba(250,204,21,0.15)] flex flex-col md:flex-row items-center gap-10 origin-top z-20 transform-gpu hover:-translate-y-2">
            <div className="w-24 h-24 rounded-full bg-yellow-400/10 flex flex-shrink-0 items-center justify-center text-4xl shadow-[0_0_20px_rgba(250,204,21,0.2)] border border-yellow-400/20 text-yellow-400">🛡️</div>
            <div>
              <h3 className="text-3xl font-bold mb-4 text-white">AI Moderation</h3>
              <p className="text-xl text-zinc-400 leading-relaxed text-balance">Real-time intelligent interception of toxic messages. Our platform enforces strict guidelines to ensure every conversation remains helpful and supportive.</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* SECTION 4: EMOTIONAL ORB / DIRECT NAVIGATION */}
      <section ref={orbSectionRef} className="min-h-screen w-full flex flex-col items-center justify-center relative bg-[#050505] border-t border-zinc-900 py-20">
        
        {/* The Orb Background (Pulsing and subtle mouse follow) */}
        <div 
          ref={orbRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-tr from-[#facc15] via-[#eab308] to-[#9a3412] blur-[80px] pointer-events-none mix-blend-screen opacity-30 animate-[pulse_4s_ease-in-out_infinite]"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 5}px), calc(-50% + ${mousePos.y * 5}px)) rotate(${mousePos.x * 5}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
        />

        <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white drop-shadow-2xl">
            Where to?
          </h2>
          <p className="text-yellow-500/80 mb-12 text-lg md:text-xl text-center">
            Choose your path. Enter the space you need right now.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
            
            <button
              onClick={() => navigate('/mood')}
              className="group relative p-10 rounded-3xl text-center border border-zinc-800 bg-[#111111]/80 overflow-hidden backdrop-blur-xl transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:bg-[#1a1a1a] hover:border-yellow-500/50 flex flex-col items-center"
            >
              <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/5 blur-xl transition-colors duration-300 pointer-events-none" />
              <div className="text-6xl mb-6 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] transition-transform duration-300">
                💬
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-yellow-500 transition-colors duration-300 mb-4">
                Anonymous Chat
              </span>
              <p className="text-zinc-500 group-hover:text-yellow-100/70 text-base leading-relaxed transition-colors duration-300">
                Connect instantly. Share your feelings in a safe, monitored real-time space.
              </p>
            </button>

            <button
              onClick={() => navigate('/feed')}
              className="group relative p-10 rounded-3xl text-center border border-zinc-800 bg-[#111111]/80 overflow-hidden backdrop-blur-xl transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:bg-[#1a1a1a] hover:border-amber-500/50 flex flex-col items-center"
            >
              <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 blur-xl transition-colors duration-300 pointer-events-none" />
              <div className="text-6xl mb-6 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] transition-transform duration-300">
                📝
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-amber-500 transition-colors duration-300 mb-4">
                Confession Feed
              </span>
              <p className="text-zinc-500 group-hover:text-amber-100/70 text-base leading-relaxed transition-colors duration-300">
                Read, react, and unleash your rawest thoughts onto the public wall.
              </p>
            </button>

            <button
              onClick={() => navigate('/help')}
              className="group relative p-10 rounded-3xl text-center border border-zinc-800 bg-[#111111]/80 overflow-hidden backdrop-blur-xl transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(250,204,21,0.4)] hover:bg-[#1a1a1a] hover:border-yellow-400/50 flex flex-col items-center"
            >
              <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/5 blur-xl transition-colors duration-300 pointer-events-none" />
              <div className="text-6xl mb-6 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] transition-transform duration-300">
                🧑‍⚕️
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 mb-4">
                Professional Help
              </span>
              <p className="text-zinc-500 group-hover:text-yellow-100/70 text-base leading-relaxed transition-colors duration-300">
                When venting isn't enough. Seek guidance from verified emotional experts.
              </p>
            </button>

          </div>

        </div>
      </section>

      <footer className="h-[15vh] w-full bg-[#030303] flex items-center justify-center border-t border-zinc-900">
        <p className="text-zinc-600 hover:text-yellow-600 transition-colors cursor-default font-medium tracking-wide text-sm">VentPod © 2026. Designed for real connection.</p>
      </footer>
    </div>
  );
}
