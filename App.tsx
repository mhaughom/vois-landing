import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { COPY } from './constants';
import { Navbar, scrollToSection } from './components/Navbar';
import { DeviceScene, setCurrentSection, SectionId } from './components/DeviceScene';
import { FlowVisualization } from './components/FlowVisualization';
import NarrativeTransition from './components/NarrativeTransition';
import { ArrowRight, Check, Sparkles, Lock, Cloud, Zap, Fingerprint, ChevronDown, X } from 'lucide-react';

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
  
  // Refs for section tracking
  const heroRef = useRef<HTMLElement>(null);
  const videoTransitionRef = useRef<HTMLElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLElement>(null);

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
  
  // Section tracking with IntersectionObserver - tells DeviceScene which section is visible
  useEffect(() => {
    const sectionMap: { ref: React.RefObject<HTMLElement | HTMLDivElement | null>; id: SectionId }[] = [
      { ref: heroRef, id: 'hero' },
      { ref: videoTransitionRef, id: 'video-transition' },
      { ref: narrativeRef, id: 'narrative' },
      { ref: captureRef, id: 'capture' },
      { ref: flowRef, id: 'flow' },
    ];
    
    // Track visibility ratios for all sections
    const visibilityMap = new Map<SectionId, number>();
    sectionMap.forEach(({ id }) => visibilityMap.set(id, id === 'hero' ? 1 : 0));
    
    // Function to determine and set the current section
    // NOTE: 'capture' section is handled directly by NarrativeTransition via scroll progress
    // This observer handles hero, video-transition, narrative, and flow
    const updateCurrentSection = () => {
      const heroRatio = visibilityMap.get('hero') || 0;
      const flowRatio = visibilityMap.get('flow') || 0;
      
      // Priority 1: Flow section (when scrolled far)
      if (flowRatio > 0.3) {
        setCurrentSection('flow');
        return;
      }
      
      // Priority 2: Hero if visible (narrative and capture handled by NarrativeTransition)
      if (heroRatio > 0.3) {
        setCurrentSection('hero');
        return;
      }
      
      // Default: pick the most visible section (excluding capture which is handled separately)
      let maxRatio = 0;
      let mostVisibleSection: SectionId = 'hero';
      
      visibilityMap.forEach((ratio, id) => {
        // Skip capture - handled by NarrativeTransition
        if (id === 'capture') return;
        if (ratio > maxRatio) {
          maxRatio = ratio;
          mostVisibleSection = id;
        }
      });
      
      if (maxRatio > 0.1) {
        setCurrentSection(mostVisibleSection);
      }
    };
    
    const observers: IntersectionObserver[] = [];
    
    sectionMap.forEach(({ ref, id }) => {
      if (!ref.current) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Update visibility ratio for this section
            visibilityMap.set(id, entry.intersectionRatio);
            // Determine which section is now most visible
            updateCurrentSection();
          });
        },
        { 
          // More granular thresholds for smoother tracking
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          rootMargin: '0px' // No margin - track actual visibility
        }
      );
      
      observer.observe(ref.current);
      observers.push(observer);
    });
    
    // CRITICAL: Run initial check immediately on mount
    // This ensures correct section is set before user scrolls
    setTimeout(() => {
      sectionMap.forEach(({ ref, id }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
          const ratio = Math.max(0, visibleHeight / rect.height);
          visibilityMap.set(id, ratio);
        }
      });
      updateCurrentSection();
    }, 100);
    
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

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
        <section ref={heroRef} id="hero" className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 md:px-16 pt-32 pb-12 gap-8 lg:gap-16">
          
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
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-slate-900 leading-[1.05] mb-6 tracking-tight">
              {COPY.hero.headline}
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-2xl md:text-3xl text-slate-500 leading-relaxed font-normal mb-4">
              {COPY.hero.subheadline}
            </motion.p>

            {/* Definition Row */}
            <motion.p variants={itemVariants} className="text-xs md:text-sm text-slate-400 tracking-widest uppercase mb-10">
              {COPY.hero.definition}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col gap-4">
               <motion.button 
                 onClick={handleScrollToPricing}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="bg-black text-white px-8 py-4 rounded-full text-base font-medium transition-transform flex items-center justify-center gap-2 shadow-xl shadow-black/10 w-fit"
               >
                 {COPY.hero.cta}
                 <ArrowRight size={18} />
               </motion.button>
               <p className="text-sm text-slate-400">
                 {COPY.hero.trustText}
               </p>
            </motion.div>
          </motion.div>

          {/* Spacer to push content down if needed, but 3D is now fixed */}
          <div className="flex-1 h-[600px] hidden lg:block" /> 

        </section>

        {/* THE UNIVERSAL LIE - Cinematic, borderless, Apple-style */}
        <section 
          ref={videoTransitionRef}
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
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 100%), linear-gradient(to right, black 0%, black 35%, transparent 65%)',
              maskComposite: 'intersect',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 100%), linear-gradient(to right, black 0%, black 35%, transparent 65%)',
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

        {/* NARRATIVE TRANSITION - Palate cleanser between Problem and Solution */}
        <div ref={narrativeRef}>
          <NarrativeTransition />
        </div>

        {/* CAPTURE SECTION - Detection now handled by NarrativeTransition via scroll progress */}
        <section ref={captureRef} id="capture" className="h-0" />

        {/* FLOW VISUALIZATION - Hourglass data flow with waveforms */}
        <section ref={flowRef} id="flow" className="relative min-h-[300vh]">
          <div className="sticky top-0 h-screen w-full">
            <FlowVisualization />
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