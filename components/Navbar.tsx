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
      <div className="pointer-events-auto flex items-center gap-4">
        {/* Login Link */}
        <Link 
          to="/login"
          className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
        >
          Log In
        </Link>
        
        {/* Get Early Access Button */}
        <motion.button 
          onClick={handleGetEarlyAccess}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
        >
          Get Early Access
        </motion.button>
      </div>
    </motion.nav>
  );
};
