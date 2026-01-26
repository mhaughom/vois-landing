import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Helper function to scroll to a section
export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetEarlyAccess = () => {
    if (location.pathname !== '/') {
      // Navigate to home first, then scroll
      navigate('/?scroll=pricing');
    } else {
      // Already on home, just scroll
      scrollToSection('pricing');
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 pointer-events-none"
    >
      {/* Logo */}
      <Link to="/" className="pointer-events-auto">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-100 shadow-sm"
        >
          <img 
            src="/Logo/vois-logo.svg" 
            alt="Vois" 
            className="h-8 w-8"
          />
          <span className="font-semibold text-sm tracking-tight text-slate-900">VOIS</span>
        </motion.div>
      </Link>
      
      {/* Right Side Navigation */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Vois for Work Link */}
        <Link 
          to="/work"
          className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
        >
          Vois for Work
        </Link>

        {/* Login Link */}
        <Link
          to="/login"
          className="hidden sm:block text-sm font-medium text-white bg-black hover:bg-black/80 transition-colors px-6 py-2.5 rounded-full"
        >
          Log In
        </Link>

        {/* Get Early Access Button - Soft pastel gradient */}
        <motion.button
          onClick={handleGetEarlyAccess}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 overflow-hidden border border-violet-200"
          style={{
            background: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 50%, #bfdbfe 100%)',
          }}
        >
          {/* Subtle animated shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.3), rgba(165,180,252,0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <span className="relative z-10 text-slate-700 font-semibold">Get Early Access</span>
        </motion.button>
      </div>
    </motion.nav>
  );
};
