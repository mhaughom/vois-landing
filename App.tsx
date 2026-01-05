import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { COPY } from './constants';
import { Navbar, scrollToSection } from './components/Navbar';
import { DeviceScene } from './components/DeviceScene';
import { ArrowRight, Check, Sparkles, Brain, Lock, Cloud, Zap, Fingerprint, ChevronDown, X } from 'lucide-react';

// Stripe Payment Link - Replace with actual link
const STRIPE_LINK = "#";

const faqData = [
  {
    question: 'What does "Lifetime Access" mean?',
    answer: 'It means you pay once and never pay a monthly subscription again. You get "Pro" status for the lifetime of the product, including fair-use access to our latest AI models.'
  },
  {
    question: "Is my voice data private?",
    answer: "Yes. We use a local-first architecture. Your recordings are processed securely, and we do not use your personal thoughts to train our public models. Your brain is yours."
  },
  {
    question: "This is a Beta. Will it be buggy?",
    answer: "To be honest: Yes, occasionally. We are building the engine while flying the plane. As a Founding Member, you get early access to features, but you might encounter glitches."
  },
  {
    question: "What if it doesn't work for me?",
    answer: "We offer a 30-day money-back guarantee. If Vois doesn't help you clear your mind in the first month, email us for a full refund."
  }
];

const App = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle scroll to section from query param (e.g., coming from login page)
  useEffect(() => {
    const scrollTarget = searchParams.get('scroll');
    if (scrollTarget) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToSection(scrollTarget);
        // Clean up the URL
        setSearchParams({});
      }, 100);
    }
  }, [searchParams, setSearchParams]);

  const handleScrollToPricing = () => {
    scrollToSection('pricing');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative w-full min-h-screen font-sans bg-background scroll-smooth snap-y snap-mandatory">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto relative z-20">
        
        {/* HERO */}
        <section id="hero" className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 md:px-16 pt-32 pb-12 gap-8 lg:gap-16">
          
          {/* Right: 3D Devices - Fixed, ON TOP of content */}
          <div className="fixed inset-0 z-30 pointer-events-none">
             <DeviceScene />
          </div>

          {/* Left: Text Content - with z-index to sit above 3D */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-xl relative z-10"
          >

            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-life-blue-light text-life-blue-dark text-xs font-semibold mb-8 uppercase tracking-wider">
               <Sparkles size={12} />
               Public Beta Live
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 leading-[1.05] mb-8 tracking-tight">
              {COPY.hero.headline}
            </motion.h1>
            
            <motion.div variants={itemVariants} className="mb-10 space-y-6">
                <p className="text-xl text-slate-500 leading-relaxed font-normal">
                  {COPY.hero.subheadline}
                </p>
                <p className="text-xl text-slate-500 leading-relaxed font-normal">
                   It remembers everything, organizes your <span className="px-2 py-0.5 rounded-md bg-life-blue-light text-life-blue-dark">calendar</span>, structures your <span className="px-2 py-0.5 rounded-md bg-life-green-light text-life-green-dark">tasks</span>, and ensures your <span className="px-2 py-0.5 rounded-md bg-life-purple-light text-life-purple-dark">best ideas</span> are never lost.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
               <motion.button 
                 onClick={handleScrollToPricing}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="bg-black text-white px-8 py-4 rounded-full text-base font-medium transition-transform flex items-center gap-2 shadow-xl shadow-black/10"
               >
                 {COPY.hero.cta}
                 <ArrowRight size={18} />
               </motion.button>
               <button className="px-8 py-4 rounded-full text-base font-medium text-slate-600 hover:bg-slate-50 transition-colors border border-slate-200">
                 Watch the Film
               </button>
            </motion.div>
          </motion.div>

          {/* Spacer to push content down if needed, but 3D is now fixed */}
          <div className="flex-1 h-[600px] hidden lg:block" /> 

        </section>

        {/* THE UNIVERSAL LIE - Cinematic, borderless, Apple-style */}
        <section 
          id="video-transition" 
          className="relative min-h-screen flex items-center snap-center snap-always overflow-hidden bg-white z-10"
          style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
        >
          {/* Right: Typography - Raw, no boxes */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute right-0 top-0 bottom-0 w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-20 z-10"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-slate-900 mb-8 lg:mb-12 leading-[1.1] tracking-tight">
              The Universal Lie
            </h2>
            <div className="space-y-6 text-lg md:text-xl text-slate-600 leading-relaxed font-light max-w-lg">
              <p>
                We all carry a hidden weight. It's 2:00 PM. You are walking to your next meeting. In your head, you are juggling a grocery list, a breakthrough idea for a project, a worry about an email you sent.
              </p>
              <p>
                You could stop. Pull out your phone. Type it all out. But you don't.
              </p>
              <p className="text-2xl md:text-3xl font-serif text-slate-900 italic leading-snug">
                You say to yourself: "I'll just remember that"
              </p>
              <p className="text-slate-400">
                (You won't.)
              </p>
            </div>
          </motion.div>

          {/* The Chaos - Full width, behind text, feathered edges (LEFT side) */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="hidden lg:block absolute inset-0 overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 100%), linear-gradient(to left, transparent 0%, black 25%, black 100%)',
              maskComposite: 'intersect',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 100%), linear-gradient(to left, transparent 0%, black 25%, black 100%)',
              WebkitMaskComposite: 'source-in'
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                objectPosition: '15% center',
                transform: 'scale(1.08) translateX(-25%)'
              }}
            >
              <source src="/videos/messy-man-loop.mov" type="video/quicktime" />
              <source src="/videos/messy-man-loop.mov" type="video/mp4" />
            </video>
          </motion.div>

          {/* Mobile: Stack layout */}
          <div className="lg:hidden absolute inset-0 flex flex-col">
            <div className="flex-1" /> {/* Spacer for text above */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-full overflow-hidden"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full object-cover"
                style={{ transform: 'scale(1.1)' }}
              >
                <source src="/videos/messy-man-loop.mov" type="video/quicktime" />
                <source src="/videos/messy-man-loop.mov" type="video/mp4" />
              </video>
            </motion.div>
          </div>
        </section>

        {/* CAPTURE SECTION - Phone left, Watch right, Text center */}
        <section id="capture" className="min-h-screen flex items-center justify-center pt-32 pb-12 px-6 md:px-16 snap-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-md mx-auto text-center px-4"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-6 leading-[1.1] tracking-tight">
              Capture at the speed of thought.
            </h2>
            <p className="text-base md:text-lg text-slate-500 mb-6 font-normal leading-snug max-w-sm mx-auto">
              The best ideas vanish in seconds. Skip the friction of unlocking and typing. Just press the action button, lockscreen, or watchface.
            </p>
            <p className="text-xs md:text-sm font-semibold text-slate-900 uppercase tracking-widest">
              Our vision is raw intent. Instantly captured.
            </p>
          </motion.div>
        </section>

        {/* FLOWING LINES - Chaotic data flowing into AI filter, sorted into 6 databases */}
        <section id="flow" className="relative min-h-[250vh] overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
          {/* SVG Lines Container - Constrained to max-width for consistency */}
          <div className="sticky top-0 h-screen w-full flex items-center justify-center">
            <div className="relative w-full max-w-6xl mx-auto h-full">
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1200 900"
                preserveAspectRatio="xMidYMid meet"
              >
              {/* Gradient and filter definitions */}
              <defs>
                {/* Animated rainbow pastel gradient for left line */}
                <linearGradient id="rainbowLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fca5a5">
                    <animate attributeName="stop-color" values="#fca5a5;#fdba74;#fde047;#86efac;#93c5fd;#c4b5fd;#fca5a5" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="25%" stopColor="#fdba74">
                    <animate attributeName="stop-color" values="#fdba74;#fde047;#86efac;#93c5fd;#c4b5fd;#fca5a5;#fdba74" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#fde047">
                    <animate attributeName="stop-color" values="#fde047;#86efac;#93c5fd;#c4b5fd;#fca5a5;#fdba74;#fde047" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="75%" stopColor="#86efac">
                    <animate attributeName="stop-color" values="#86efac;#93c5fd;#c4b5fd;#fca5a5;#fdba74;#fde047;#86efac" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#93c5fd">
                    <animate attributeName="stop-color" values="#93c5fd;#c4b5fd;#fca5a5;#fdba74;#fde047;#86efac;#93c5fd" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                
                {/* Animated rainbow pastel gradient for right line */}
                <linearGradient id="rainbowRight" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c4b5fd">
                    <animate attributeName="stop-color" values="#c4b5fd;#93c5fd;#86efac;#fde047;#fdba74;#fca5a5;#c4b5fd" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="25%" stopColor="#93c5fd">
                    <animate attributeName="stop-color" values="#93c5fd;#86efac;#fde047;#fdba74;#fca5a5;#c4b5fd;#93c5fd" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#86efac">
                    <animate attributeName="stop-color" values="#86efac;#fde047;#fdba74;#fca5a5;#c4b5fd;#93c5fd;#86efac" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="75%" stopColor="#fde047">
                    <animate attributeName="stop-color" values="#fde047;#fdba74;#fca5a5;#c4b5fd;#93c5fd;#86efac;#fde047" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#fdba74">
                    <animate attributeName="stop-color" values="#fdba74;#fca5a5;#c4b5fd;#93c5fd;#86efac;#fde047;#fdba74" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Left flow path (from phone area) - rainbow colored */}
              <motion.path
                d="M 150 50 Q 200 200 400 300 Q 500 380 600 420"
                fill="none"
                stroke="url(#rainbowLeft)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.8 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              {/* Right flow path (from watch area) - rainbow colored */}
              <motion.path
                d="M 1050 50 Q 1000 200 800 300 Q 700 380 600 420"
                fill="none"
                stroke="url(#rainbowRight)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.8 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
              
              {/* 6 Output paths from filter to databases */}
              {[
                { path: "M 600 500 Q 500 600 200 700", color: "#fca5a5" }, // Events - pink
                { path: "M 600 500 Q 520 600 350 720", color: "#fdba74" }, // Tasks - orange
                { path: "M 600 500 Q 560 620 480 750", color: "#fde047" }, // Ideas - yellow
                { path: "M 600 500 Q 640 620 720 750", color: "#86efac" }, // Health - green
                { path: "M 600 500 Q 680 600 850 720", color: "#93c5fd" }, // Messages - blue
                { path: "M 600 500 Q 700 600 1000 700", color: "#c4b5fd" }, // Finance - purple
              ].map((item, i) => (
                <motion.path
                  key={`output-path-${i}`}
                  d={item.path}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#softGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.6 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 2 + i * 0.15 }}
                />
              ))}
              
              {/* CHAOTIC PARTICLES - Left side (from phone) */}
              {/* Pastel color palette: pink, orange, yellow, green, blue, purple */}
              {[
                "#fca5a5", "#fdba74", "#fde047", "#86efac", "#93c5fd", "#c4b5fd",
                "#f9a8d4", "#fcd34d", "#a5f3fc", "#d8b4fe", "#fda4af", "#bef264"
              ].map((color, colorIndex) => (
                [...Array(3)].map((_, i) => (
                  <motion.circle
                    key={`particle-left-${colorIndex}-${i}`}
                    r={4 + Math.random() * 4}
                    fill={color}
                    filter="url(#softGlow)"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.9, 0.9, 0],
                      cx: [130 + Math.random() * 40, 300 + Math.random() * 100, 500 + Math.random() * 50, 600],
                      cy: [30 + Math.random() * 40, 180 + Math.random() * 80, 320 + Math.random() * 60, 420],
                    }}
                    transition={{
                      duration: 2.5 + Math.random() * 1.5,
                      delay: colorIndex * 0.3 + i * 0.8 + Math.random() * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))
              ))}
              
              {/* CHAOTIC PARTICLES - Right side (from watch) */}
              {[
                "#fca5a5", "#fdba74", "#fde047", "#86efac", "#93c5fd", "#c4b5fd",
                "#f9a8d4", "#fcd34d", "#a5f3fc", "#d8b4fe", "#fda4af", "#bef264"
              ].map((color, colorIndex) => (
                [...Array(3)].map((_, i) => (
                  <motion.circle
                    key={`particle-right-${colorIndex}-${i}`}
                    r={4 + Math.random() * 4}
                    fill={color}
                    filter="url(#softGlow)"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.9, 0.9, 0],
                      cx: [1030 + Math.random() * 40, 900 - Math.random() * 100, 700 - Math.random() * 50, 600],
                      cy: [30 + Math.random() * 40, 180 + Math.random() * 80, 320 + Math.random() * 60, 420],
                    }}
                    transition={{
                      duration: 2.5 + Math.random() * 1.5,
                      delay: colorIndex * 0.3 + i * 0.8 + Math.random() * 0.5 + 0.3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))
              ))}
              
              {/* SORTED PARTICLES - Coming out of filter into 6 databases */}
              {[
                { color: "#fca5a5", endX: 200, endY: 700, label: "Events" },
                { color: "#fdba74", endX: 350, endY: 720, label: "Tasks" },
                { color: "#fde047", endX: 480, endY: 750, label: "Ideas" },
                { color: "#86efac", endX: 720, endY: 750, label: "Health" },
                { color: "#93c5fd", endX: 850, endY: 720, label: "Messages" },
                { color: "#c4b5fd", endX: 1000, endY: 700, label: "Finance" },
              ].map((item, categoryIndex) => (
                [...Array(4)].map((_, i) => (
                  <motion.circle
                    key={`sorted-${categoryIndex}-${i}`}
                    r="5"
                    fill={item.color}
                    filter="url(#softGlow)"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      cx: [600, 600 + (item.endX - 600) * 0.3, 600 + (item.endX - 600) * 0.7, item.endX],
                      cy: [500, 560 + i * 10, 640 + i * 5, item.endY + i * 8],
                    }}
                    transition={{
                      duration: 2,
                      delay: 2.5 + categoryIndex * 0.2 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                ))
              ))}
            </svg>
            
              {/* AI Filter visualization at the merge point */}
              <motion.div 
                className="absolute top-[42%] left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <div className="relative">
                  {/* Glowing ring - multicolor to match incoming particles */}
                  <div className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse" 
                       style={{ 
                         width: '140px', 
                         height: '140px', 
                         margin: '-18px',
                         background: 'conic-gradient(from 0deg, #fca5a5, #fdba74, #fde047, #86efac, #93c5fd, #c4b5fd, #fca5a5)'
                       }} />
                  
                  {/* Main filter circle */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-white/20 flex items-center justify-center shadow-2xl">
                    <div className="text-center">
                      <Brain className="w-10 h-10 text-white mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">AI Filter</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* 6 Database icons at bottom - Modern pill design */}
              {[
                { x: '8%', color: '#ef4444', bgFrom: '#fef2f2', bgTo: '#fee2e2', label: 'Events', icon: '📅' },
                { x: '24%', color: '#f97316', bgFrom: '#fff7ed', bgTo: '#ffedd5', label: 'Tasks', icon: '✓' },
                { x: '40%', color: '#eab308', bgFrom: '#fefce8', bgTo: '#fef9c3', label: 'Ideas', icon: '💡' },
                { x: '60%', color: '#22c55e', bgFrom: '#f0fdf4', bgTo: '#dcfce7', label: 'Health', icon: '♥' },
                { x: '76%', color: '#3b82f6', bgFrom: '#eff6ff', bgTo: '#dbeafe', label: 'Messages', icon: '💬' },
                { x: '92%', color: '#8b5cf6', bgFrom: '#faf5ff', bgTo: '#f3e8ff', label: 'Finance', icon: '$' },
              ].map((db, i) => (
                <motion.div 
                  key={`db-${i}`}
                  className="absolute bottom-[10%]"
                  style={{ left: db.x, transform: 'translateX(-50%)' }}
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 2.2 + i * 0.12, ease: "easeOut" }}
                >
                  <div 
                    className="relative group cursor-pointer"
                  >
                    {/* Glow effect on hover */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-300"
                      style={{ backgroundColor: db.color }}
                    />
                    
                    {/* Main card */}
                    <div 
                      className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg border transition-transform duration-300 group-hover:scale-110"
                      style={{ 
                        background: `linear-gradient(135deg, ${db.bgFrom} 0%, ${db.bgTo} 100%)`,
                        borderColor: `${db.color}30`
                      }}
                    >
                      {/* Icon */}
                      {db.icon === '✓' ? (
                        <Check className="w-6 h-6 md:w-7 md:h-7" style={{ color: db.color }} />
                      ) : db.icon === '♥' ? (
                        <div className="text-xl md:text-2xl" style={{ color: db.color }}>♥</div>
                      ) : db.icon === '$' ? (
                        <div className="text-xl md:text-2xl font-bold" style={{ color: db.color }}>$</div>
                      ) : (
                        <span className="text-xl md:text-2xl">{db.icon}</span>
                      )}
                    </div>
                    
                    {/* Label */}
                    <p 
                      className="text-[10px] md:text-xs font-semibold text-center mt-2 transition-colors duration-300"
                      style={{ color: db.color }}
                    >
                      {db.label}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Labels */}
              <motion.div 
                className="absolute top-[5%] left-[5%] text-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="text-sm font-medium text-slate-500">From iPhone</p>
                <p className="text-xs text-slate-400">Raw voice data</p>
              </motion.div>
              
              <motion.div 
                className="absolute top-[5%] right-[5%] text-center"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <p className="text-sm font-medium text-slate-500">From Watch</p>
                <p className="text-xs text-slate-400">Quick captures</p>
              </motion.div>
              
              <motion.div 
                className="absolute top-[58%] left-1/2 -translate-x-1/2 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                <p className="text-xl font-serif text-slate-800">Intelligently Sorted</p>
                <p className="text-sm text-slate-500">Your chaos, organized into clarity</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* DEMO (Text Content) - LEFT side for watch on right */}
        <section id="demo" className="py-24 px-6 md:px-16">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="max-w-xl mr-auto ml-6 lg:ml-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-100"
            >
               <div className="flex items-center gap-3 mb-6 text-life-purple-dark">
                  <Zap size={20} className="fill-current" />
                  <span className="font-mono text-xs uppercase tracking-widest">Realtime Processing</span>
               </div>
               <p className="text-xl md:text-2xl font-serif italic text-slate-400 mb-6 leading-relaxed">
                 {COPY.demo.input}
               </p>
               <div className="pl-6 border-l-2 border-slate-200">
                  <p className="text-slate-900 font-medium text-sm">{COPY.demo.caption}</p>
               </div>
            </motion.div>
        </section>

        {/* ADAPT - LEFT side for watch on right */}
        <section id="adapt" className="py-24 px-6 md:px-16">
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="max-w-xl mr-auto ml-6 lg:ml-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-100"
           >
             <h2 className="text-2xl md:text-3xl font-serif text-slate-900 mb-4">{COPY.adapt.title}</h2>
             <p className="text-base text-slate-500 leading-relaxed max-w-lg mb-8">
               {COPY.adapt.body}
             </p>
             <div className="grid gap-3 max-w-sm">
                {[
                  { label: 'Headache Tracker', color: 'bg-life-pink-light', text: 'text-life-pink-dark' }, 
                  { label: 'Meditation Streaks', color: 'bg-life-cyan-light', text: 'text-life-cyan-dark' }, 
                  { label: 'Dream Journal', color: 'bg-life-purple-light', text: 'text-life-purple-dark' }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-2xl ${item.color} ${item.text} flex items-center justify-between`}
                  >
                    <span className="font-medium text-sm">{item.label}</span>
                    <div className="w-7 h-7 bg-white/50 rounded-full flex items-center justify-center">
                       <Check size={12} />
                    </div>
                  </motion.div>
                ))}
             </div>
           </motion.div>
        </section>

        {/* PRIVACY - LEFT side for watch on right */}
        <section id="privacy" className="py-24 px-6 md:px-16">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="max-w-xl mr-auto ml-6 lg:ml-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-100"
           >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 mb-6">
                <Fingerprint size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-slate-900 mb-4">{COPY.privacy.title}</h2>
              <p className="text-base text-slate-500 leading-relaxed max-w-lg">
                {COPY.privacy.body}
              </p>
              
              <div className="mt-8 flex items-center gap-3 text-sm font-medium text-slate-900">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200">
                      <Lock size={14} /> Local First
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200">
                      <Cloud size={14} /> Encrypted Sync
                  </div>
              </div>
           </motion.div>
        </section>

        {/* SECTION 5: FAQ */}
        <section id="faq" className="py-24 px-6 md:px-16">
          <div className="max-w-2xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-serif text-slate-900 text-center mb-12"
            >
              Common Questions
            </motion.h2>
            
            <div className="divide-y divide-slate-200">
              {faqData.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                  >
                    <span className="text-lg font-medium text-slate-900 group-hover:text-slate-600 transition-colors pr-4">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown size={20} className="text-slate-400" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-slate-500 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: THE FOUNDER'S DEAL */}
        <section id="pricing" className="py-24 px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-lg mx-auto"
          >
            <div className="bg-slate-950 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/30 border border-slate-800 relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-50 pointer-events-none" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 uppercase tracking-wider">
                  <Sparkles size={12} />
                  Limited Batch: Founder's Edition
                </div>
                
                {/* Headline */}
                <h2 className="text-2xl md:text-3xl font-serif text-white mb-6 leading-tight">
                  Stop Renting Your Software.
                </h2>
                
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-5xl md:text-6xl font-bold text-white tracking-tight">$99</span>
                  <span className="text-2xl text-slate-500 line-through">$199</span>
                  <span className="text-sm text-slate-400 ml-2">one-time</span>
                </div>
                
                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {[
                    "Lifetime Pro Access",
                    "No Monthly Fees",
                    "Private Discord Access",
                    "Early Feature Drops"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-emerald-400" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Scarcity */}
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-slate-400">
                    <span className="text-white font-semibold">74</span> / 100 Spots Remaining
                  </span>
                </div>
                
                {/* CTA Button - Opens Stripe Payment Link */}
                <a 
                  href={STRIPE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white text-slate-950 py-4 rounded-full text-lg font-semibold hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg text-center"
                >
                  Get Early Access
                </a>
                
                {/* Guarantee */}
                <p className="text-center text-slate-500 text-sm mt-4">
                  30-day money-back guarantee.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* SECTION 7: FOOTER */}
        <footer className="py-16 px-6 md:px-16 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              
              {/* Col 1: Logo & Tagline */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="/Logo/vois-logo.svg" 
                    alt="Vois" 
                    className="h-8 w-8"
                  />
                  <span className="font-serif font-medium text-slate-900 text-lg">Vois</span>
                </div>
                <p className="text-slate-500 text-sm">Clear your mind.</p>
              </div>
              
              {/* Col 2: Product */}
              <div>
                <h4 className="text-slate-900 font-medium text-sm mb-4">Product</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/login" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Download iOS
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* Col 3: Legal */}
              <div>
                <h4 className="text-slate-900 font-medium text-sm mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/legal#privacy" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/legal#terms" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/legal#refund" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Col 4: Social */}
              <div>
                <h4 className="text-slate-900 font-medium text-sm mb-4">Social</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-slate-500 text-sm hover:text-slate-900 transition-colors flex items-center gap-2">
                      <X size={14} />
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
                      TikTok
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-xs">
                &copy; {new Date().getFullYear()} Vois AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default App;