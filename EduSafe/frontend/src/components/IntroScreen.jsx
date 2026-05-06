import React, { useState, useEffect, useRef } from 'react';

const IntroScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [showLightning, setShowLightning] = useState(false);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [characterExiting, setCharacterExiting] = useState(false);
  const [characterEntered, setCharacterEntered] = useState(false);
  const [fadeOutContent, setFadeOutContent] = useState(false);
  const canvasRef = useRef(null);
  const hasSkipped = useRef(false); // prevent multiple skip calls

  // Skip intro function – called on any click
  const skipIntro = () => {
    if (hasSkipped.current) return;
    hasSkipped.current = true;
    onComplete();
  };

  // Particle system (unchanged)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    let particles = [];
    for (let i = 0; i < 350; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: (Math.random() - 0.5) * 1.2,
        color: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, 255, ${Math.random() * 0.6 + 0.2})`
      });
    }
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timeline
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 500);
    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (phase === 1) {
      const walkInTimer = setTimeout(() => setCharacterEntered(true), 1500);
      const lightningTimer = setTimeout(() => {
        setShowLightning(true);
        setShake(true);
        setTimeout(() => {
          setShowLightning(false);
          setShake(false);
        }, 600);
      }, 2000);
      const phase2Timer = setTimeout(() => setPhase(2), 3500);
      return () => {
        clearTimeout(walkInTimer);
        clearTimeout(lightningTimer);
        clearTimeout(phase2Timer);
      };
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 2) {
      const startExitTimer = setTimeout(() => {
        setCharacterExiting(true);
        setFadeOutContent(true);
        setTimeout(() => setPhase(3), 2000);
      }, 3000);
      return () => clearTimeout(startExitTimer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 3) {
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          setPhase(4);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 4) {
      onComplete();
    }
  }, [phase, onComplete]);

  const features = [
    "AI QUIZ GENERATOR", "GAMIFIED LEARNING", "LIVE CLASSES",
    "SMART RECOMMENDATIONS", "DAILY CHALLENGES", "VOICE TUTOR",
    "MESSAGING HUB", "RESOURCE LIBRARY", "PROGRESS ANALYTICS",
    "SAFETY DRILLS", "AI ASSISTANT", "CERTIFICATIONS",
    "PARENT PORTAL", "VIDEO CONFERENCE", "AUTO-GRADING"
  ];
  const col1 = features.slice(0,5);
  const col2 = features.slice(5,10);
  const col3 = features.slice(10,15);

  const leftCharClass = `absolute left-4 md:left-12 top-1/4 w-48 h-72 md:w-72 md:h-96 z-10 pointer-events-none transition-all duration-[2000ms] ease-out ${
    characterExiting ? '-translate-x-full opacity-0 delay-0' : (phase >= 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0')
  } ${characterEntered && !characterExiting ? 'animate-body-sway' : ''}`;

  const rightCharClass = `absolute right-4 md:right-12 top-1/4 w-48 h-72 md:w-72 md:h-96 z-10 pointer-events-none transition-all duration-[2000ms] ease-out ${
    characterExiting ? 'translate-x-full opacity-0 delay-0' : (phase >= 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0')
  } ${characterEntered && !characterExiting ? 'animate-body-sway' : ''}`;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black overflow-hidden ${shake ? 'animate-shake' : ''}`}
      onClick={skipIntro}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 hex-grid opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none scanlines"></div>

      {/* Rotating Omnitrix rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-2">
        <div className="relative w-[700px] h-[700px] scale-75 md:scale-100">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-spin-slow"></div>
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-spin-reverse" style={{ width: '88%', height: '88%', top: '6%', left: '6%' }}></div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-spin-slower" style={{ width: '72%', height: '72%', top: '14%', left: '14%' }}></div>
          <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-pulse" style={{ width: '56%', height: '56%', top: '22%', left: '22%' }}></div>
        </div>
      </div>

      {/* LEFT CHARACTER: Goku (unchanged) */}
      <div className={leftCharClass}>
        <div className="relative w-full h-full">
          <svg viewBox="0 0 160 240" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* SVG content – same as before */}
            <path d="M80 10 L92 0 L98 14 L112 6 L108 22 L126 20 L115 35 L135 42 L122 56 L100 50 L80 65 L60 50 L38 56 L25 42 L45 35 L34 20 L52 22 L48 6 L62 14 L68 0 L80 10Z" fill="#F5A623" stroke="#D88C1A" strokeWidth="2"/>
            <g className="animate-head-bob">
              <path d="M50 50 Q80 35 110 50 Q120 70 115 95 Q110 120 80 125 Q50 120 45 95 Q40 70 50 50Z" fill="#F5C6A0" stroke="#C79A6E" strokeWidth="2"/>
              <ellipse cx="62" cy="65" rx="8" ry="11" fill="#2C2C2C"/>
              <ellipse cx="98" cy="65" rx="8" ry="11" fill="#2C2C2C"/>
              <circle cx="65" cy="62" r="3" fill="white"/>
              <circle cx="101" cy="62" r="3" fill="white"/>
              <path d="M50 54 L68 58" stroke="#2C2C2C" strokeWidth="3"/>
              <path d="M110 54 L92 58" stroke="#2C2C2C" strokeWidth="3"/>
              <path d="M65 85 Q80 98 95 85" stroke="#C96A3E" strokeWidth="2.5" fill="none"/>
            </g>
            <path d="M45 100 L55 155 L80 185 L105 155 L115 100 L130 125 L115 185 L80 225 L45 185 L30 125 Z" fill="#F97316" stroke="#EA580C" strokeWidth="2"/>
            <path d="M45 185 L25 220 L58 220 L80 195 L102 220 L135 220 L115 185" fill="#F97316" stroke="#EA580C" strokeWidth="2"/>
            <rect x="55" y="142" width="50" height="12" fill="#1F2937" rx="4"/>
            <rect x="75" y="140" width="10" height="18" fill="#FFD700" rx="2"/>
            <path d="M25 220 L12 235 L48 235 L52 220" fill="#E74C3C" stroke="#C0392B" strokeWidth="2"/>
            <path d="M135 220 L148 235 L112 235 L108 220" fill="#E74C3C" stroke="#C0392B" strokeWidth="2"/>
            <g className="animate-arm-wave-left">
              <path d="M45 120 L20 100 L25 85 L35 95 L45 110" fill="#F5C6A0" stroke="#C79A6E" strokeWidth="2"/>
              <circle cx="28" cy="88" r="7" fill="#F5C6A0"/>
            </g>
            <g className="animate-arm-wave-right">
              <path d="M115 120 L140 100 L135 85 L125 95 L115 110" fill="#F5C6A0" stroke="#C79A6E" strokeWidth="2"/>
              <circle cx="132" cy="88" r="7" fill="#F5C6A0"/>
            </g>
            <circle cx="80" cy="140" r="60" fill="url(#gokuAura)" className="animate-pulse" opacity="0.4"/>
            <defs>
              <radialGradient id="gokuAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <path d="M115 125 L145 100" stroke="#F59E0B" strokeWidth="5" strokeDasharray="6 6" className="animate-pulse"/>
            <circle cx="145" cy="100" r="10" fill="#F59E0B" className="animate-pulse">
              <animate attributeName="r" values="6;15;6" dur="0.7s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </div>

      {/* RIGHT CHARACTER: Ben 10 (unchanged) */}
      <div className={rightCharClass}>
        <div className="relative w-full h-full">
          <svg viewBox="0 0 160 240" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* SVG content – same as before */}
            <path d="M80 10 L92 0 L98 14 L112 6 L108 22 L126 20 L115 35 L135 42 L122 56 L100 50 L80 65 L60 50 L38 56 L25 42 L45 35 L34 20 L52 22 L48 6 L62 14 L68 0 L80 10Z" fill="#1F2937"/>
            <g className="animate-head-bob">
              <path d="M50 50 Q80 35 110 50 Q120 70 115 95 Q110 120 80 125 Q50 120 45 95 Q40 70 50 50Z" fill="#F5C6A0" stroke="#C79A6E" strokeWidth="2"/>
              <circle cx="62" cy="65" r="8" fill="#0F172A"/>
              <circle cx="98" cy="65" r="8" fill="#0F172A"/>
              <circle cx="65" cy="62" r="2.5" fill="white"/>
              <circle cx="101" cy="62" r="2.5" fill="white"/>
              <path d="M50 54 L68 58" stroke="#0F172A" strokeWidth="3"/>
              <path d="M110 54 L92 58" stroke="#0F172A" strokeWidth="3"/>
              <path d="M65 86 Q80 96 95 86" stroke="#C96A3E" strokeWidth="2.5" fill="none"/>
            </g>
            <path d="M45 100 L55 155 L80 185 L105 155 L115 100 L130 125 L115 185 L80 225 L45 185 L30 125 Z" fill="#10B981" stroke="#059669" strokeWidth="2"/>
            <path d="M45 185 L25 220 L58 220 L80 195 L102 220 L135 220 L115 185" fill="#10B981" stroke="#059669" strokeWidth="2"/>
            <rect x="55" y="142" width="50" height="12" fill="#1F2937" rx="4"/>
            <circle cx="80" cy="130" r="12" fill="#111111" stroke="#00ff00" strokeWidth="3" className="animate-pulse"/>
            <circle cx="80" cy="130" r="6" fill="#00ff00"/>
            <path d="M25 220 L10 235 L50 235 L54 220" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
            <path d="M135 220 L150 235 L110 235 L106 220" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
            <g className="animate-arm-wave-left">
              <path d="M45 120 L20 100 L25 85 L35 95 L45 110" fill="#F5C6A0" stroke="#C79A6E" strokeWidth="2"/>
              <circle cx="28" cy="88" r="7" fill="#F5C6A0"/>
            </g>
            <g className="animate-arm-wave-right">
              <path d="M115 120 L140 100 L135 85 L125 95 L115 110" fill="#F5C6A0" stroke="#C79A6E" strokeWidth="2"/>
              <circle cx="132" cy="88" r="7" fill="#F5C6A0"/>
            </g>
            <circle cx="80" cy="140" r="60" fill="url(#benAura)" className="animate-pulse" opacity="0.4"/>
            <defs>
              <radialGradient id="benAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#00f2fe" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <path d="M45 125 L15 100" stroke="#00f2fe" strokeWidth="5" strokeDasharray="6 6" className="animate-pulse"/>
            <circle cx="15" cy="100" r="10" fill="#00f2fe" className="animate-pulse">
              <animate attributeName="r" values="6;15;6" dur="0.7s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </div>

      {/* Lightning flash */}
      {showLightning && (
        <div className="absolute inset-0 bg-white/80 pointer-events-none animate-lightning-flash" style={{ zIndex: 20 }}></div>
      )}

      {/* Main content (fades out during character exit) – no credits here */}
      <div className={`relative z-30 flex flex-col items-center justify-center min-h-screen transition-all duration-[2000ms] ease-out ${fadeOutContent ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative group mt-8">
          <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-3xl opacity-70 animate-pulse-slow"></div>
          <div className="relative w-44 h-44 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-gray-950 to-black border-4 border-emerald-500/80 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-36 h-36 md:w-52 md:h-52 text-white animate-spin-slow" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50,10 L60,30 L80,25 L75,45 L95,55 L75,65 L80,85 L60,80 L50,100 L40,80 L20,85 L25,65 L5,55 L25,45 L20,25 L40,30 Z" />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-full flex items-center justify-center shadow-neon-cyan animate-pulse">
                <span className="text-4xl md:text-7xl font-black text-white drop-shadow-lg">ES</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-8 text-center transform transition-all duration-1000 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl md:text-7xl font-black relative glitch" data-text="EduSafe">EduSafe</h1>
          <p className="text-sm md:text-base text-cyan-300 mt-2 tracking-widest font-mono">⚡ OMNITRIX CORE | ALIEN TECH ⚡</p>
        </div>

        <div className={`w-full max-w-5xl mx-auto px-6 mt-8 transition-all duration-1000 delay-400 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[col1, col2, col3].map((col, idx) => (
              <div key={idx} className="space-y-2">
                {col.map((f, i) => (
                  <div key={i} className="px-3 py-2 text-sm md:text-base font-mono font-bold rounded-full bg-black/60 backdrop-blur-sm border border-cyan-500/50 text-cyan-300 shadow-md transition-all hover:scale-105">
                    {f}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Countdown overlay – phase 3 (credits enhanced) */}
      {phase === 3 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="absolute top-10 left-0 right-0 text-center">
            <div className="inline-block px-6 py-3 rounded-full bg-black/70 backdrop-blur-sm border border-emerald-500/60 shadow-neon-emerald">
              <p className="text-base md:text-lg font-mono font-bold bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-md">
                <span className="text-cyan-300">⌘</span> CREATED BY <span className="text-cyan-300">SATYAM TYAGI</span> & <span className="text-cyan-300">SHIVAM TYAGI</span> <span className="text-cyan-300">⌘</span>
              </p>
            </div>
          </div>
          <div className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse tracking-widest drop-shadow-2xl mt-16">
            {countdown}
          </div>
          <div className="mt-10 px-10 py-4 rounded-full bg-black/80 backdrop-blur-lg border-2 border-cyan-500/90 shadow-2xl shadow-cyan-500/50">
            <p className="text-2xl md:text-3xl font-bold text-cyan-300 font-mono tracking-wider animate-pulse">
              ⚡ PRESS ANYWHERE TO LAUNCH ⚡
            </p>
          </div>
          <p className="text-sm text-gray-400 mt-8">(touch or click anywhere)</p>
        </div>
      )}

      <style>{`
        .hex-grid {
          background-image: repeating-linear-gradient(90deg, rgba(16,185,129,0.1) 0px, rgba(16,185,129,0.1) 1px, transparent 1px, transparent 60px),
                            repeating-linear-gradient(0deg, rgba(0,242,254,0.1) 0px, rgba(0,242,254,0.1) 1px, transparent 1px, transparent 60px);
        }
        .scanlines {
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 4px);
        }
        @keyframes body-sway {
          0%, 100% { transform: rotateY(0deg) rotate(0deg); }
          25% { transform: rotateY(4deg) rotate(1deg); }
          75% { transform: rotateY(-4deg) rotate(-1deg); }
        }
        @keyframes head-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(2deg); }
        }
        @keyframes arm-wave-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-12deg); }
        }
        @keyframes arm-wave-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(12deg); }
        }
        .animate-body-sway {
          animation: body-sway 3s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 500px;
        }
        .animate-head-bob {
          animation: head-bob 1.8s ease-in-out infinite;
          transform-origin: center 70%;
        }
        .animate-arm-wave-left {
          animation: arm-wave-left 1.2s ease-in-out infinite;
          transform-origin: 45px 120px;
        }
        .animate-arm-wave-right {
          animation: arm-wave-right 1.4s ease-in-out infinite;
          transform-origin: 115px 120px;
        }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes spin-slower { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 12s linear infinite; }
        .animate-spin-slower { animation: spin-slower 18s linear infinite; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        @keyframes lightning-flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          20% { opacity: 0; }
          30% { opacity: 0.8; }
          40% { opacity: 0; }
          100% { opacity: 0; }
        }
        .animate-lightning-flash { animation: lightning-flash 0.5s ease-out forwards; }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-8px, 0); }
          20% { transform: translate(8px, 0); }
          30% { transform: translate(-5px, 0); }
          40% { transform: translate(5px, 0); }
          50% { transform: translate(0, 0); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .glitch {
          position: relative;
          animation: glitch-skew 3s infinite;
        }
        .glitch::before, .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: black;
        }
        .glitch::before {
          animation: glitch-anim-1 0.8s infinite linear alternate-reverse;
          color: #0f0;
          z-index: -1;
        }
        .glitch::after {
          animation: glitch-anim-2 0.8s infinite linear alternate-reverse;
          color: #0ff;
          z-index: -2;
        }
        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 30% 0); transform: translate(-2px, 2px); }
          100% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
        }
        @keyframes glitch-anim-2 {
          0% { clip-path: inset(50% 0 20% 0); transform: translate(2px, -2px); }
          100% { clip-path: inset(10% 0 60% 0); transform: translate(-2px, 2px); }
        }
        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          10% { transform: skew(2deg); }
          20% { transform: skew(-2deg); }
          30% { transform: skew(0deg); }
        }
        .bg-radial-gradient {
          background: radial-gradient(circle at center, rgba(16,185,129,0.3) 0%, transparent 70%);
        }
        .shadow-neon-cyan {
          box-shadow: 0 0 8px #00f2fe, 0 0 25px #00f2fe;
        }
        .shadow-neon-emerald {
          box-shadow: 0 0 8px #10b981, 0 0 22px #10b981;
        }
      `}</style>
    </div>
  );
};

export default IntroScreen;